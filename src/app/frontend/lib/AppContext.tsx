import React, { createContext, useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const defaultAppConfig: AppConfig = {
  launchArgs: null,
};

type AppContextType = [
  null | string,
  AppConfig,
  React.Dispatch<React.SetStateAction<AppConfig>>?
];

type AppConfig = {
  launchArgs: null | {
    [key: string]: string;
  };
};

const PersoniumAppContext = createContext<null | AppContextType>(null);

export function useAppContext() {
  const appContext = useContext(PersoniumAppContext);
  if (!appContext)
    throw 'useAppContext must be called in children of <PersoniumAppProvider>';

  const [appCellUrl, config, setConfig] = appContext;

  if (!setConfig) throw 'illegal usage of useAppContext';

  return {
    appCellUrl,
    config: {
      launchArgs: config.launchArgs,
    },
    setConfig: {
      setLaunchArgs: useCallback(
        launchArgs => setConfig(c => Object.assign({}, c, { launchArgs })),
        [setConfig]
      ),
      rawSetConfig: setConfig,
    },
  };
}

type AppProviderProps = {
  appCellUrl: string;
  children: React.ReactNode;
};

export const PersoniumAppProvider: React.FC<AppProviderProps> = ({
  appCellUrl,
  children,
}) => {
  const [config, setConfig] = useState(defaultAppConfig);
  return (
    <PersoniumAppContext.Provider value={[appCellUrl, config, setConfig]}>
      {children}
    </PersoniumAppContext.Provider>
  );
};

PersoniumAppProvider.propTypes = {
  appCellUrl: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
