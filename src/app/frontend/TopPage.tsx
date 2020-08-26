import React, { useCallback } from 'react';
import { Edit, Close } from '@material-ui/icons';
import { DraftEditor, CreatePage } from './DraftEditor';
import { DraftProvider } from './contexts/DraftContext';
import { Dialog, Fab, Container } from '@material-ui/core';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';

export const TopPage: React.FC = () => {
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
        <Container>
          <h1>Top Page</h1>
        </Container>
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
