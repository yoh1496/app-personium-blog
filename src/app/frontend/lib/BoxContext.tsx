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

type BoxContextType = [boolean, BoxURLError, BoxURL];

const PersoniumBoxContext = createContext<null | BoxContextType>(null);

async function getBoxUrl(
  cellUrl: string,
  access_token: string,
  schemaUrl: undefined | string = undefined
) {
  const requestUrl = new URL(`${cellUrl}__box`);
  if (schemaUrl !== undefined) {
    requestUrl.searchParams.set('schema', schemaUrl);
  }
  const res = await fetch(requestUrl.toString(), {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    if (res.status !== 403) {
      throw { status: res.status, statusText: res.statusText };
    }
  }
  return res.headers.get('location');
}

type UseBoxContextResult = {
  loading: boolean;
  error: null | string;
  boxUrl: null | string;
};
export function useBoxContext(): UseBoxContextResult {
  const boxContext = useContext(PersoniumBoxContext);

  if (!boxContext)
    throw 'useBoxContext must be called in children of <PersoniumBoxProvider>';
  const [loading, error, boxUrl] = boxContext;

  return {
    loading,
    error,
    boxUrl,
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
    async (cellUrl, access_token) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getBoxUrl(cellUrl, access_token);
        if (!unmounted.current) {
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
    if (cellUrl === null) {
      return function cleanup() {};
    }
    unmounted.current = false;
    refreshBoxUrl(cellUrl, auth?.access_token);
    return function cleanup() {
      unmounted.current = true;
    };
  }, [cellUrl, auth?.access_token, refreshBoxUrl]);

  return (
    <PersoniumBoxContext.Provider value={[loading, error, boxUrl]}>
      {children}
    </PersoniumBoxContext.Provider>
  );
};

PersoniumBoxProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
