import React, { createContext, useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const defaultAppConfig: AppConfig = {
  appCellUrl: null,
  launchArgs: null,
};

type AppContextType = [
  AppConfig,
  React.Dispatch<React.SetStateAction<AppConfig>>?
];

type AppConfig = {
  appCellUrl: null | string;
  launchArgs: null | {
    [key: string]: string;
  };
};

const PersoniumAppContext = createContext<AppContextType>([defaultAppConfig]);

export function useAppContext() {
  const [config, setConfig] = useContext(PersoniumAppContext);

  if (!setConfig) throw 'illegal usage of useAppContext';

  return {
    config: {
      appCellUrl: config.appCellUrl,
      launchArgs: config.launchArgs,
    },
    setConfig: {
      setAppCellUrl: useCallback(
        appCellUrl => setConfig(c => Object.assign({}, c, { appCellUrl })),
        [setConfig]
      ),
      setLaunchArgs: useCallback(
        launchArgs => setConfig(c => Object.assign({}, c, { launchArgs })),
        [setConfig]
      ),
      rawSetConfig: setConfig,
    },
  };
}

export const PersoniumAppProvider: React.FunctionComponent<{
  children: React.Component;
}> = ({ children }) => {
  const [config, setConfig] = useState(defaultAppConfig);
  return (
    <PersoniumAppContext.Provider value={[config, setConfig]}>
      {children}
    </PersoniumAppContext.Provider>
  );
};
