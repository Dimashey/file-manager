import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { notify } from '../../utils/notify';

type Severity = 'error' | 'success';

type Notification = {
  message: string;
  severity: Severity;
}

export const AppNotifier = () => {
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    notify.register(
      (message) => setNotification({ message, severity: 'error' }),
      (message) => setNotification({ message, severity: 'success' }),
    );
  }, []);

  return (
    <Snackbar
      open={notification !== null}
      autoHideDuration={4000}
      onClose={() => setNotification(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setNotification(null)}
        severity={notification?.severity ?? 'error'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
}
