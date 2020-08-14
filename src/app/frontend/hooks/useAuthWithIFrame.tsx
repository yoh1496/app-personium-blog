import { useCallback, useEffect, useState, useRef, RefObject } from 'react';

type AuthCode = {
  state: string;
  code: string;
};

type useAuthWithIFrameResult = {
  result: null | AuthCode;
  iframeRef: RefObject<HTMLIFrameElement>;
};

export function useAuthWithIFrame(): useAuthWithIFrameResult {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [result, setResult] = useState<null | AuthCode>(null);

  const handleMessage = useCallback(
    event => {
      console.log(event);

      // checking event source is equal to iframe
      if (iframeRef.current === null) return;
      if (iframeRef.current.contentWindow !== event.source) {
        // do nothing
        return;
      }

      if (event.data.type === 'authDone') {
        event.source.postMessage('', event.origin);
      }

      if (event.data.type === 'authCode') {
        const { code, state } = event.data;
        if (typeof code !== 'string') throw `code is not string: ${code}`;
        if (typeof state !== 'string') throw `state is not string: ${state}`;
        setResult({ code, state });
      }
    },
    [setResult]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return function cleanup() {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return { result, iframeRef };
}
