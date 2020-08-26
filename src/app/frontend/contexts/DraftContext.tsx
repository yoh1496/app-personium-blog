import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { OutputData, OutputBlockData } from '@editorjs/editorjs';
import { useDraftContextIndexedDB } from '../hooks/useDraftContextIndexedDB';
import * as UUID from 'uuid';
import * as path from 'path';

const welcomeBlocks = [
  {
    type: 'header',
    data: {
      text: 'Editor.js',
      level: 2,
    },
  },
  {
    type: 'paragraph',
    data: {
      text:
        'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.',
    },
  },
];

interface ImageBlock extends OutputBlockData {
  type: string;
  data: {
    file: {
      url: string;
      key?: string;
    };
    caption?: string;
    withBorder?: boolean;
    withBackground?: boolean;
    stretched?: boolean;
  };
}

type DraftContextType = {
  draft: OutputData;
  setDraft: React.Dispatch<React.SetStateAction<OutputData>>;
};

const DraftContext = React.createContext<null | DraftContextType>(null);

function usePersoniumWebDAV(boxUrl: string, access_token: string) {
  if (!boxUrl.endsWith('/')) throw `boxUrl is malformed : "${boxUrl}"`;

  const defaultHeader = useMemo(
    () => ({
      Authorization: `Bearer ${access_token}`,
    }),
    [access_token]
  );

  return {
    createCollection: useCallback(
      async path => {
        const targetURL = new URL(path, boxUrl);
        const res = await fetch(targetURL.toString(), {
          method: 'MKCOL',
          headers: defaultHeader,
        });
        return res;
      },
      [boxUrl, defaultHeader]
    ),
    putFile: useCallback(
      async (path: string, file: File) => {
        const targetURL = new URL(encodeURI(path), boxUrl);
        const res = await fetch(targetURL.toString(), {
          method: 'PUT',
          headers: Object.assign({}, defaultHeader, {
            'Content-Type': file.type,
          }),
          body: file,
        });
        return res;
      },
      [boxUrl, defaultHeader]
    ),
    checkExists: useCallback(
      async path => {
        const targetURL = new URL(path, boxUrl);
        const res = await fetch(targetURL.toString(), {
          method: 'PROPFIND',
          headers: Object.assign({}, defaultHeader, { depth: '1' }),
        });
        return res;
      },
      [boxUrl, defaultHeader]
    ),
    downloadFile: useCallback(
      async path => {
        const targetURL = new URL(path, boxUrl);
        const res = await fetch(targetURL.toString(), {
          method: 'GET',
          headers: defaultHeader,
        });
        return res;
      },
      [boxUrl, defaultHeader]
    ),
  };
}

export const DraftProvider: React.FC = ({ children }) => {
  const [draft, setDraft] = useState<OutputData>({
    blocks: [],
  });

  return (
    <DraftContext.Provider value={{ draft, setDraft }}>
      {children}
    </DraftContext.Provider>
  );
};

DraftProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

type UseDraftPublisherResult = {
  publishToWebdav: (articleID: string) => Promise<void>;
};

export function useDraftPublisher(
  boxUrl: string,
  access_token: string
): UseDraftPublisherResult {
  const db = useDraftContextIndexedDB();

  const {
    createCollection,
    checkExists,
    putFile,
    downloadFile,
  } = usePersoniumWebDAV(boxUrl, access_token);

  const publishToWebdav = useCallback(
    async (articleID: string) => {
      const folderName = articleID;
      const imageFolderName = `${articleID}/images`;

      // check folder exist
      const result = await checkExists(folderName);
      if (result.status === 404) {
        // create folder
        const folderCreation = await createCollection(folderName);
        // make `images` subdirectory
        const folderCreation2 = await createCollection(imageFolderName);
        console.log('folder created', folderCreation);
      }
      console.log(result);

      // process blocks
      const draftData = await db.drafts.limit(1).first();
      if (!draftData) throw 'draftData not found';

      console.log(draftData);

      draftData.blocks = await Promise.all(
        draftData.blocks.map(async block => {
          if (block.type === 'image' && 'key' in block.data.file) {
            console.log(block);
            // : upload image
            const content = await db.images.get(block.data.file.key);
            if (!content) throw 'content is null';
            const ext = content.file.name.split('.').pop();
            const newName = `${UUID.v4()}.${ext}`;
            const putResult = await putFile(
              path.join(imageFolderName, newName),
              content.file
            );
            // : rename URL
            const newURL = path.join('images', newName);
            return Object.assign({}, block, {
              data: Object.assign({}, block.data, { file: { url: newURL } }),
            });
          }
          return block;
        })
      );

      // upload main content
      console.log(JSON.stringify(draftData));
      const draftFile = new File(
        [JSON.stringify(draftData, null, 2)],
        'content.json',
        {
          type: 'text/json',
        }
      );
      console.log(
        await putFile(path.join(folderName, 'content.json'), draftFile)
      );

      // upload entrypoint
      const indexFile = await downloadFile('__template/index.html');

      // download to memory
      const buff = await indexFile.arrayBuffer();
      console.log(
        await putFile(
          path.join(folderName, 'index.html'),
          new File([buff], 'index.html', { type: 'text/html' })
        )
      );
    },
    [db, checkExists, createCollection, putFile, downloadFile]
  );

  return { publishToWebdav };
}

export function useDraftContext() {
  const draftContext = useContext(DraftContext);
  if (!draftContext)
    throw 'useDraftContext must be used in children of <DraftProvider>';

  const { draft, setDraft } = draftContext;
  const db = useDraftContextIndexedDB();

  const revertURLFromKey = useCallback(
    async (blocks: Array<OutputBlockData>) => {
      return Promise.all(
        blocks.map(async block => {
          console.log('revertURLFromKey', block);
          if (block.type === 'image') {
            if ('key' in block.data.file) {
              const content = await db.images.get(block.data.file.key);
              if (!content) throw 'image not found';

              const imgUrl = URL.createObjectURL(content.file);
              return {
                type: block.type,
                data: Object.assign(block.data, {
                  file: Object.assign({}, block.data.file, { url: imgUrl }),
                }),
              };
            }
          }
          return Object.assign({}, block);
        })
      );
    },
    [db]
  );

  const loadDraft = useCallback(async () => {
    const draftData = await db.drafts.limit(1).first();
    console.log('loaded', draftData);
    if (draftData) {
      const converted = {
        time: draftData.time,
        // sanitize
        blocks: await revertURLFromKey(draftData.blocks),
        version: draftData.version,
      };
      setDraft(converted);
      console.log('converted', converted);
    } else {
      setDraft({
        // initial block
        blocks: welcomeBlocks,
      });
    }
  }, [db, revertURLFromKey, setDraft]);

  const updateDraft = useCallback(
    async newData => {
      const draftData = await db.drafts.limit(1).first();
      if (draftData) {
        await db.drafts.update(draftData, newData);
      } else {
        await db.drafts.put(newData);
      }
    },
    [db]
  );

  useEffect(() => {
    loadDraft().then(() => {
      console.log('loaded');
    });
  }, [loadDraft]);

  const uploadByFile = useCallback(
    async (file: File) => {
      const cloned = new File([await file.arrayBuffer()], file.name, {
        type: file.type,
      });
      const fileKey = await db.images.put({ file: cloned });
      const content = await db.images.get(fileKey);
      if (!content) throw 'content is null';
      const imageUrl = URL.createObjectURL(content.file);
      return {
        success: 1,
        file: {
          url: imageUrl,
          key: fileKey,
        },
      };
    },
    [db]
  );

  const uploadByUrl = useCallback(async (url: string) => {
    return {
      success: 1,
      file: {
        url,
      },
    };
  }, []);

  return {
    draftData: draft,
    updateDraft,
    uploadByFile,
    uploadByUrl,
  };
}
