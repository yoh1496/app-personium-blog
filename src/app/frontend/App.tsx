import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { TopPage } from './TopPage';

import { PersoniumAppProvider } from './lib/AppContext';
import { PersoniumUserProvider } from './lib/UserContext';
import { PersoniumBoxProvider } from './lib/BoxContext';

export const App: React.FC = () => {
  return (
    <PersoniumAppProvider appCellUrl="https://app-ishiguro-02.appdev.personium.io/">
      <PersoniumUserProvider>
        <PersoniumBoxProvider>
          <AppBar position="absolute" style={{ position: 'relative' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit">
                <Menu />
              </IconButton>
              <Typography variant="h6">Personium Blog</Typography>
            </Toolbar>
          </AppBar>
          <Switch>
            <Route exact path="/">
              <TopPage />
            </Route>
          </Switch>
        </PersoniumBoxProvider>
      </PersoniumUserProvider>
    </PersoniumAppProvider>
  );
};
