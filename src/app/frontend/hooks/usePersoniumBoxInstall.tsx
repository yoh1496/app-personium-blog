import { useState, useCallback } from 'react';
import { useAppContext, useUserContext } from '../lib';

type StatusLog = {
  time: number;
  text: string;
};

type usePersoniumBoxInstallResult = {
  loading: boolean;
  error: null | StatusLog;
  status: StatusLog[];
  installBar: () => Promise<void>;
};

export function usePersoniumBoxInstall(
  barPath = '__/app.bar',
  boxName: string
): usePersoniumBoxInstallResult {
  const { appCellUrl } = useAppContext();
  const { auth, cellUrl } = useUserContext(appCellUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | StatusLog>(null);
  const [status, setStatus] = useState<StatusLog[]>([]);

  const updateInstallStatus = useCallback(
    text => {
      setStatus(c => [...c, { time: Date.now(), text }]);
    },
    [setStatus]
  );

  const installBar = useCallback(async () => {
    let pollingStatusID = -1;
    setLoading(true);

    if (!auth) throw 'not authorized';

    const { access_token } = auth;

    if (access_token === undefined) {
      setError({ time: Date.now(), text: 'no auth token' });
      setLoading(false);
      return;
    }
    const res = await fetch(barPath);
    if (res.status !== 200) {
      setError({ time: Date.now(), text: 'Downloading Barfile is failed' });
      setLoading(false);
      return;
    }

    // download to memory
    const buff = await res.arrayBuffer();
    console.log(`Downloaded ${buff.byteLength} bytes`);

    const boxURL = `${cellUrl}${boxName}`;

    const sendRes = await fetch(boxURL, {
      method: 'MKCOL',
      body: buff,
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/zip',
      },
      redirect: 'manual',
    });

    if (sendRes.status === 202) {
      // Accepted
      // const boxStatusURL = sendRes.headers.get('location');
      let timeoutID: number = window.setTimeout(() => {
        if (pollingStatusID !== -1) {
          clearInterval(pollingStatusID);
          pollingStatusID = -1;
          timeoutID = -1;
          setLoading(false);
          setError({ time: Date.now(), text: 'timeout' });
          updateInstallStatus('timeout');
        }
      }, 30000);
      pollingStatusID = window.setInterval(async () => {
        const boxStatus = await fetch(boxURL, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }).then(res => res.json());
        const statusText =
          boxStatus.box.status === 'ready'
            ? boxStatus.box.status
            : `${boxStatus.box.status} ${boxStatus.box.progress}`;
        updateInstallStatus(statusText);

        if (boxStatus.box.status === 'ready') {
          setLoading(false);
          if (pollingStatusID !== -1) {
            clearInterval(pollingStatusID);
            pollingStatusID = -1;
          }
          if (timeoutID !== -1) {
            clearTimeout(timeoutID);
            timeoutID = -1;
          }
        }
      }, 500);
    }
  }, [
    setLoading,
    setError,
    auth,
    barPath,
    boxName,
    updateInstallStatus,
    cellUrl,
  ]);

  return { loading, error, status, installBar };
}
