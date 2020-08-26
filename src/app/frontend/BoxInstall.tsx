import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { usePersoniumBoxInstall } from './hooks/usePersoniumBoxInstall';
import { Paper, Typography, Button } from '@material-ui/core';

type BoxInstallViewProps = {
  onInstalled: () => void;
};

export const BoxInstallView: React.FC<BoxInstallViewProps> = ({
  onInstalled,
}) => {
  const { loading, error, status, installBar } = usePersoniumBoxInstall(
    'https://app-ishiguro-02.appdev.personium.io/__/app-ishiguro-02.bar',
    'app-ishiguro-02'
  );

  const handleClick = useCallback(() => {
    if (loading) return;
    installBar().then(() => {
      onInstalled();
    });
  }, [installBar, onInstalled, loading]);

  return (
    <Paper elevation={0}>
      <Typography variant="h6">
        Your cell does not have any boxes for this app.
      </Typography>
      <Typography variant="body1">
        Press button below to create a box for this app.
      </Typography>
      <Button variant="contained" onClick={handleClick}>
        Create Box
      </Button>
      <dl>
        {status.map(item => {
          return (
            <div key={`status-${item.time}`}>
              <dt>{new Date(item.time).toTimeString()}</dt>
              <dd>{item.text}</dd>
            </div>
          );
        })}
      </dl>
      {!error ? null : (
        <div style={{ color: 'red' }}>
          {error.text} ({new Date(error.time).toTimeString()})
        </div>
      )}
    </Paper>
  );
};

BoxInstallView.propTypes = {
  onInstalled: PropTypes.func.isRequired,
};
