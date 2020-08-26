import React, { createContext, useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const defaultUserConfig: AuthInfo = {
  cellUrl: null,
  auth: null,
};

type UserContextType = [
  AuthInfo,
  React.Dispatch<React.SetStateAction<AuthInfo>>?
];

type AuthInfo = {
  cellUrl: null | string;
  auth: null | AuthTokens;
};

type AuthTokens = {
  access_token: string;
};

const PersoniumUserContext = createContext<null | UserContextType>(null);

export function useUserContext(appCellUrl: null | string) {
  const userContext = useContext(PersoniumUserContext);
  if (!userContext) {
    throw 'useUserContext must be called in children of <PersoniumUserProvider>';
  }

  const [authInfo, setAuthInfo] = userContext;

  if (!setAuthInfo) throw 'illegal usage of useUserContext';

  const requestAuthURL = useCallback(
    async (cellUrl, redirect_uri = '/__/auth/receive_redirect') => {
      if (!cellUrl) throw 'cellUrl is null';
      if (!appCellUrl) throw 'appCellUrl is null';

      const authUrl = new URL(`${appCellUrl}__/auth/start_oauth2`);
      authUrl.searchParams.set('cellUrl', cellUrl);

      const res = await fetch(authUrl.toString(), {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log(res.headers);

      if (!res.ok) {
        throw {
          status: res.status,
          statusText: res.statusText,
        };
      }

      const oauthFormURL = new URL(res.url);
      const redirectURI = oauthFormURL.searchParams.get('redirect_uri');

      if (redirectURI === null) {
        // result broken
        throw `illegal url is returned ${res.url}`;
      }

      let redirectURIobject = new URL(decodeURI(redirectURI));
      if (redirect_uri instanceof URL) {
        redirectURIobject = redirect_uri;
      } else {
        redirectURIobject.pathname = redirect_uri;
      }
      oauthFormURL.searchParams.set(
        'redirect_uri',
        encodeURI(redirectURIobject.toString())
      );
      return oauthFormURL;
    },
    [appCellUrl]
  );

  const authWithAuthCode = useCallback(
    async (cellUrl, code, state) => {
      const authUrl = new URL(`${appCellUrl}__/auth/receive_redirect`);
      authUrl.searchParams.set('cellUrl', cellUrl);
      authUrl.searchParams.set('code', code);
      authUrl.searchParams.set('state', state);
      const res = await fetch(authUrl.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!res.ok) {
        throw {
          status: res.status,
          statusText: res.statusText,
        };
      }
      setAuthInfo({
        cellUrl: cellUrl,
        auth: await res.json(),
      });
      return null;
    },
    [appCellUrl, setAuthInfo]
  );

  const logout = useCallback(async () => {
    setAuthInfo(c => Object.assign({}, c, { cellUrl: null, auth: null }));
  }, [setAuthInfo]);

  return {
    cellUrl: authInfo.cellUrl,
    auth: authInfo.auth,
    requestAuthURL,
    authWithAuthCode,
    logout,
  };
}

type UserProviderProps = {
  children: React.ReactNode;
};

export const PersoniumUserProvider: React.FC<UserProviderProps> = ({
  children,
}) => {
  const [config, setConfig] = useState(defaultUserConfig);
  return (
    <PersoniumUserContext.Provider value={[config, setConfig]}>
      {children}
    </PersoniumUserContext.Provider>
  );
};

PersoniumUserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
