import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { useDraftContext, useDraftPublisher } from './contexts/DraftContext';
const EditorHeader = require('@editorjs/header'); // eslint-disable-line
const EditorImage = require('@editorjs/image'); // eslint-disable-line

import EditorJS from '@editorjs/editorjs';
import Editor from '@stfy/react-editor.js';

import {
  Container,
  Button,
  Grid,
  TextField,
  Paper,
  Box,
} from '@material-ui/core';
import { useAppContext } from './lib/AppContext';

import { useUserContext } from './lib/UserContext';
import { useBoxContext } from './lib/BoxContext';
import { useAuthWithIFrame } from './hooks/useAuthWithIFrame';

export const DraftEditor: React.FC<{ onEditFinished: () => void }> = ({
  onEditFinished,
}) => {
  const {
    draftData,
    updateDraft,
    uploadByFile,
    uploadByUrl,
  } = useDraftContext();

  const refEditor = useRef<EditorJS | null>(null);
  const refContainer = useRef<Editor | null>(null);

  const handlePublishClicked = useCallback(() => {
    onEditFinished();
  }, [onEditFinished]);

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
    [refEditor, updateDraft]
  );

  const tools = useMemo(() => {
    return {
      header: EditorHeader,
      image: {
        class: EditorImage,
        config: {
          uploader: {
            uploadByFile,
            uploadByUrl,
          },
        },
      },
    };
  }, [uploadByFile, uploadByUrl]);

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
      <div id="editor-wrapper" style={{ height: '100%', overflowY: 'scroll' }}>
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
        <Container style={{ paddingBottom: 32 }}>
          <Grid container direction="row" justify="flex-end">
            <Button
              color="secondary"
              variant="contained"
              onClick={handlePublishClicked}
            >
              Publish
            </Button>
          </Grid>
        </Container>
      </div>
    </>
  );
};

DraftEditor.propTypes = {
  onEditFinished: PropTypes.func.isRequired,
};

type CellInputProps = {
  onEnterCell: (cellUrl: string) => void;
};
const CellInput: React.FC<CellInputProps> = ({ onEnterCell }) => {
  const [cellUrl, setCellUrl] = useState<string>('');

  const onChange = useCallback(
    e => {
      setCellUrl(e.target.value);
    },
    [setCellUrl]
  );
  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onEnterCell(cellUrl);
      return false;
    },
    [onEnterCell, cellUrl]
  );

  return (
    <Paper
      component="form"
      style={{ display: 'flex' }}
      elevation={0}
      onSubmit={onSubmit}
    >
      <TextField
        label="CellURL"
        variant="outlined"
        style={{ flex: 1 }}
        placeholder="https://usercell.appdev.personium.io/"
        value={cellUrl}
        onChange={onChange}
      />
      <Button type="submit" style={{ marginLeft: 8 }}>
        Submit
      </Button>
    </Paper>
  );
};

CellInput.propTypes = {
  onEnterCell: PropTypes.func.isRequired,
};

type UserAuthProps = {
  cellUrl: string;
  onLogin: () => void;
};

const UserAuth: React.FC<UserAuthProps> = ({ cellUrl, onLogin }) => {
  const { result, iframeRef } = useAuthWithIFrame();

  const { appCellUrl } = useAppContext();
  const { requestAuthURL, authWithAuthCode } = useUserContext(appCellUrl);

  const [loading, setLoading] = useState<boolean>(true);
  const [authUrl, setAuthUrl] = useState<null | string>(null);

  useEffect(() => {
    console.log(cellUrl);
    setLoading(true);

    requestAuthURL(cellUrl, '/__/auth/receive_redirect_page')
      .then(result => {
        setAuthUrl(result.toString());
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    return function cleanup() {
      setLoading(false);
    };
  }, [requestAuthURL, cellUrl]);

  useEffect(() => {
    if (result === null) {
      return;
    }
    console.log(result);
    authWithAuthCode(cellUrl, result.code, result.state).then(() => {
      onLogin();
      console.log('authenticated');
    });
  }, [result, onLogin, cellUrl, authWithAuthCode]);

  if (loading) {
    return <div>Loading AuthWithIFrame... </div>;
  }

  if (authUrl === null) {
    return <div>Cannot get AuthUrl</div>;
  }

  return (
    <>
      <h3>Personium Authentication</h3>
      <iframe
        style={{ width: '100%', height: '60%' }}
        ref={iframeRef}
        src={authUrl}
        name="oauth_iframe"
      />
    </>
  );
};

UserAuth.propTypes = {
  cellUrl: PropTypes.string.isRequired,
  onLogin: PropTypes.func.isRequired,
};

const DraftPublisher3: React.FC<{
  onPublishFinished: () => void;
  boxUrl: string;
  access_token: string;
}> = ({ onPublishFinished, boxUrl, access_token }) => {
  const { publishToWebdav } = useDraftPublisher(boxUrl, access_token);
  const [articleId, setArticleId] = useState<string>('');

  const handleChange = useCallback(
    e => {
      setArticleId(e.target.value);
    },
    [setArticleId]
  );
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      publishToWebdav(articleId);
      onPublishFinished();
      return false;
    },
    [publishToWebdav, onPublishFinished, articleId]
  );

  return (
    <Paper
      component="form"
      style={{ display: 'flex' }}
      elevation={0}
      onSubmit={handleSubmit}
    >
      <TextField
        label="ArticleID"
        variant="outlined"
        style={{ flex: 1 }}
        placeholder="1234567"
        value={articleId}
        onChange={handleChange}
      />
      <Button type="submit" style={{ marginLeft: 8 }}>
        Submit
      </Button>
      <div>The article will be saved: {`${boxUrl}${articleId}/index.html`}</div>
    </Paper>
  );
};

DraftPublisher3.propTypes = {
  onPublishFinished: PropTypes.func.isRequired,
  boxUrl: PropTypes.string.isRequired,
  access_token: PropTypes.string.isRequired,
};
const DraftPublisher2: React.FC<{ onPublishFinished: () => void }> = ({
  onPublishFinished,
}) => {
  const { appCellUrl } = useAppContext();
  const { auth } = useUserContext(appCellUrl);
  const { loading, error, boxUrl } = useBoxContext();

  if (loading) return <div>Loading boxUrl...</div>;
  if (error) return <div> error happened: {error}</div>;

  if (!auth) throw 'not authorized';
  if (!boxUrl) throw 'boxUrl is null';

  return (
    <DraftPublisher3
      onPublishFinished={onPublishFinished}
      access_token={auth?.access_token}
      boxUrl={boxUrl}
    />
  );
};

DraftPublisher2.propTypes = {
  onPublishFinished: PropTypes.func.isRequired,
};

const DraftPublisher: React.FC<{ onPublishFinished: () => void }> = ({
  onPublishFinished,
}) => {
  const { appCellUrl } = useAppContext();
  const { cellUrl, auth } = useUserContext(appCellUrl);
  const [userCell, setUserCell] = useState<null | string>(cellUrl);

  const handleEnterCell = useCallback(
    cellUrl => {
      setUserCell(cellUrl);
    },
    [setUserCell]
  );

  const handleLogin = useCallback(() => {
    console.log('logged in ');
  }, []);

  if (!userCell) {
    // input cell url
    return (
      <Container style={{ height: '100%' }}>
        <Box
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <CellInput onEnterCell={handleEnterCell} />
        </Box>
      </Container>
    );
  }

  if (!auth) {
    return (
      <Container style={{ height: '100%' }}>
        <Box
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <UserAuth cellUrl={userCell} onLogin={handleLogin} />
        </Box>
      </Container>
    );
  }

  return (
    <Container style={{ height: '100%' }}>
      <Box
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <DraftPublisher2 onPublishFinished={onPublishFinished} />
      </Box>
    </Container>
  );
};

DraftPublisher.propTypes = {
  onPublishFinished: PropTypes.func.isRequired,
};

enum STEP {
  editing,
  publishing,
  finished,
}
export const CreatePage: React.FC = () => {
  const [step, setStep] = useState(STEP.editing);

  const handleEditFinished = useCallback(() => {
    setStep(STEP.publishing);
  }, [setStep]);

  const handlePublishFinished = useCallback(() => {
    setStep(STEP.finished);
  }, [setStep]);

  if (step === STEP.editing) {
    return <DraftEditor onEditFinished={handleEditFinished} />;
  }

  if (step === STEP.publishing) {
    return <DraftPublisher onPublishFinished={handlePublishFinished} />;
  }

  return <div>done.</div>;
};
