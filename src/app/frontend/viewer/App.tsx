import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@stfy/react-editor.js';
import EditorJS from '@editorjs/editorjs';

const EditorHeader = require('@editorjs/header'); // eslint-disable-line
const EditorImage = require('@editorjs/image'); // eslint-disable-line
const EditorList = require('@editorjs/list'); // eslint-disable-line
const EditorMarker = require('@editorjs/marker'); // eslint-disable-line
const EditorDelimiter = require('@editorjs/delimiter'); // eslint-disable-line
const EditorInlineCode = require('@editorjs/inline-code'); // eslint-disable-line
const EditorWarning = require('@editorjs/warning'); // eslint-disable-line

function useData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<EditorJS.OutputData | null>(null);

  const updateData = useCallback(async () => {
    const res = await fetch('content.json');
    if (!res.ok) {
      setError({ status: res.status, statusText: res.statusText });
      setLoading(false);
      return;
    }
    const jsonDat = await res.json();
    setData({
      time: jsonDat.time,
      version: jsonDat.version,
      blocks: jsonDat.blocks,
    });
    setLoading(false);
  }, [setError, setData, setLoading]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  return { loading, error, data };
}

export const App: React.FC = () => {
  const { loading, error, data } = useData();

  const tools = useMemo(() => {
    return {
      header: EditorHeader,
      warning: EditorWarning,
      marker: EditorMarker,
      list: EditorList,
      delimiter: EditorDelimiter,
      inlineCode: EditorInlineCode,
      image: EditorImage,
    };
  }, []);

  if (loading) return <h1>Loading...</h1>;
  if (data === null || error)
    return (
      <>
        <h1>Error happended</h1>
        <div>{JSON.stringify(error)}</div>
      </>
    );

  return (
    <>
      <div className="editor-landing__demo">
        <div
          className="editor_landing__inner"
          style={{
            background: '#fff',
            padding: '16px 8px',
          }}
        >
          <div id="editorjs-container" />
          <Editor
            reinitOnPropsChange
            autofocus
            holder="editorjs-container"
            tools={tools}
            data={data}
          />
          <footer>
            This article is edited by{' '}
            <a href="https://app-ishiguro-02.appdev.personium.io/__/front/app">
              https://app-ishiguro-02.appdev.personium.io/__/front/app
            </a>
          </footer>
        </div>
      </div>
    </>
  );
};
