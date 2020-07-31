import React, { useCallback } from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  Fab,
} from '@material-ui/core';
import { Menu, Edit, Close } from '@material-ui/icons';
import { CreatePage } from './CreatePage';
import { DraftProvider } from './DraftContext';

type Props = {};

const Hello: React.FunctionComponent<Props> = () => {
  const [open, setOpen] = React.useState(false);
  const handleClick = useCallback(() => {
    setOpen(c => !c);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  return (
    <div>
      <DraftProvider>
        <h1>Hello React!</h1>
        <Dialog open={open} fullScreen>
          <AppBar position="sticky" color="secondary">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="close"
                onClick={handleClose}
              >
                <Close />
              </IconButton>
              <Typography variant="h6">Draft</Typography>
            </Toolbar>
          </AppBar>
          {open ? <CreatePage /> : null}
        </Dialog>
      </DraftProvider>
      <Fab
        color="primary"
        aria-label="edit"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 16,
        }}
        onClick={handleClick}
      >
        <Edit />
      </Fab>
    </div>
  );
};

export const App: React.FunctionComponent<Props> = () => {
  return (
    <>
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
          <Hello />
        </Route>
        <Route path="/create">
          <CreatePage />
        </Route>
      </Switch>
    </>
  );
};
