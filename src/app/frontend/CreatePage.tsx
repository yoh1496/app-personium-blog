import React, {
  useCallback,
  useState,
  SetStateAction,
  useContext,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { Menu, ThreeDRotationTwoTone } from '@material-ui/icons';

const EditorHeader = require('@editorjs/header');
const EditorImage = require('@editorjs/image');

import EditorJS from '@editorjs/editorjs';
import Editor from '@stfy/react-editor.js';

import { useDraftContext } from './DraftContext';

import mime from 'mime-types';
import { v4 as uuid } from 'uuid';
import { access } from 'fs';
import { Container, Button, Grid } from '@material-ui/core';

type Props = {};

interface AccessTokenContextInterface {
  access_token: string;
  setAccessToken: React.Dispatch<SetStateAction<string>>;
}

const AccessTokenContext = React.createContext({
  access_token: '',
  setAccessToken: () => {},
} as AccessTokenContextInterface);

function useAccessToken() {
  const { access_token, setAccessToken } = useContext(AccessTokenContext);
  return { access_token };
}

const AccessTokenProvider: React.FC<{}> = ({ children }) => {
  const [access_token, setAccessToken] = useState('');
  return (
    <AccessTokenContext.Provider value={{ access_token, setAccessToken }}>
      {children}
    </AccessTokenContext.Provider>
  );
};

const AccessTokenEditor: React.FC<{}> = () => {
  const { access_token, setAccessToken } = useContext(AccessTokenContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessToken(e.target.value);
  };
  return (
    <div>
      <input type="text" onChange={handleChange} value={access_token} />
    </div>
  );
};

function useEditorFileuploader(access_token: string, boxUrl: string) {
  console.log('#useEditorFileuploader', access_token);
  const uploadByFile = useCallback(
    async (file: File) => {
      const sleep = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      const fs = new FileReader();
      fs.readAsDataURL(file);

      const newFilename = `${uuid()}.${mime.extension(file.type)}`;
      const newFileURL = `${boxUrl}${newFilename}`;
      try {
        const res = await fetch(newFileURL, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          body: file,
        });

        if (!res.ok) {
          throw {
            status: res.status,
            statusText: res.statusText,
          };
        }

        return {
          success: 1,
          file: {
            url: newFileURL,
          },
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    [access_token, boxUrl]
  );

  return {
    uploadByFile,
  };
}

const DraftEditor: React.FunctionComponent<{}> = () => {
  const {
    draftData,
    updateDraft,
    uploadByFile,
    uploadByUrl,
    publishToWebdav,
  } = useDraftContext();
  const { access_token } = useAccessToken();

  const refEditor = useRef<EditorJS | null>(null);
  const refContainer = useRef<Editor | null>(null);

  const handleSave = useCallback(async () => {}, []);

  console.log('access_token', access_token);

  const handleChange = useCallback(
    async a => {
      if (refContainer.current === null) {
        return;
      }

      if ('save' in refContainer.current.editor) {
        console.log('refEditor', refEditor.current);
        const data = await refContainer.current.editor.save();
        if (data) {
          await updateDraft(data);
          console.log(data);
        }
      }
    },
    [refEditor]
  );

  const additionalRequestHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${access_token}`,
    }),
    [access_token]
  );

  const tools = useMemo(() => {
    console.log(additionalRequestHeaders);
    return {
      header: EditorHeader,
      image: {
        class: EditorImage,
        config: {
          uploader: {
            uploadByFile,
            uploadByUrl,
          },

          additionalRequestHeaders,
        },
      },
    };
  }, [additionalRequestHeaders]);

  const handleRef = useCallback(
    ref => {
      console.log('ref', ref);
      if (ref === null) return;
      refContainer.current = ref;
      refEditor.current = ref.editor;
    },
    [refEditor]
  );

  return (
    <>
      <div id="editor-wrapper" style={{ height: '80%', overflowY: 'scroll' }}>
        <div id="editorjs-container" />
        <Editor
          reinitOnPropsChange
          autofocus
          ref={handleRef}
          holder="editorjs-container"
          onChange={handleChange}
          tools={tools}
          data={draftData}
        />
        <Container>
          <Grid container direction="row" justify="flex-end">
            <Button
              color="secondary"
              variant="contained"
              onClick={() => publishToWebdav('hoge', 'fuga')}
            >
              Publish
            </Button>
          </Grid>
        </Container>
      </div>
    </>
  );
};

enum STEP {
  editing,
  inputCellUrl,
}
export const CreatePage: React.FunctionComponent<Props> = () => {
  const [step, setStep] = useState(STEP.editing);

  return (
    <>
      <AccessTokenProvider>
        {/* <AccessTokenEditor /> */}
        <DraftEditor />
      </AccessTokenProvider>
    </>
  );
};
