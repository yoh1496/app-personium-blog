import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from './AppContext';
import { useUserContext } from './UserContext';

type BoxURLError = null | string;
type BoxURL = null | string;
type BoxURLRefresher = (cellUrl: string, access_token: string) => Promise<void>;

type BoxContextType = [boolean, BoxURLError, BoxURL, BoxURLRefresher];

const PersoniumBoxContext = createContext<null | BoxContextType>(null);

async function getBoxUrl(
  cellUrl: string,
  access_token: string,
  schemaUrl: undefined | string = undefined
): Promise<BoxURL> {
  const requestUrl = new URL(`${cellUrl}__box`);
  if (schemaUrl !== undefined) {
    requestUrl.searchParams.set('schema', schemaUrl);
  }
  const res = await fetch(requestUrl.toString(), {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    // if there are no box for app, it returns 403
    if (res.status !== 403) {
      throw { status: res.status, statusText: res.statusText };
    }
    // box not found
    return null;
  }
  return res.headers.get('location');
}

type UseBoxContextResult = {
  loading: boolean;
  error: null | string;
  boxUrl: null | string;
  refreshBoxUrl: BoxURLRefresher;
};
export function useBoxContext(): UseBoxContextResult {
  const boxContext = useContext(PersoniumBoxContext);

  if (!boxContext)
    throw 'useBoxContext must be called in children of <PersoniumBoxProvider>';
  const [loading, error, boxUrl, refreshBoxUrl] = boxContext;

  return {
    loading,
    error,
    boxUrl,
    refreshBoxUrl,
  };
}

export const PersoniumBoxProvider: React.FC = ({ children }) => {
  const { appCellUrl } = useAppContext();
  const { auth, cellUrl } = useUserContext(appCellUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [boxUrl, setBoxUrl] = useState<null | string>(null);

  const unmounted = useRef(false);

  const refreshBoxUrl = useCallback(
    async (cellUrl: string, access_token: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getBoxUrl(cellUrl, access_token);
        if (!unmounted.current) {
          console.log('getBoxUrl: ', JSON.stringify(result));
          setError(null);
          setBoxUrl(result);
          setLoading(false);
        }
      } catch (err) {
        if (!unmounted.current) {
          setError(err);
          setBoxUrl(null);
          setLoading(false);
        }
        throw err;
      }
    },
    [setLoading, setError]
  );

  useEffect(() => {
    if (cellUrl === null) return;
    if (auth === null) return;
    unmounted.current = false;
    refreshBoxUrl(cellUrl, auth.access_token);
    return function cleanup() {
      unmounted.current = true;
    };
  }, [cellUrl, auth, refreshBoxUrl]);

  return (
    <PersoniumBoxContext.Provider
      value={[loading, error, boxUrl, refreshBoxUrl]}
    >
      {children}
    </PersoniumBoxContext.Provider>
  );
};

PersoniumBoxProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
