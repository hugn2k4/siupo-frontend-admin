import { useEffect } from 'react';
import { useSnackbar } from '../contexts/SnackbarProvider';
import { useGlobal } from '../hooks/useGlobal';
import { registerAuthHandlers } from '../utils/authUtils';

/**
 * Initialize authentication handlers for Admin
 * This component registers the global logout and snackbar handlers
 * so they can be used by axios interceptors
 */
export default function AuthHandlerInitializer({ children }) {
  const { logout } = useGlobal();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // Register handlers once when component mounts
    registerAuthHandlers(logout, showSnackbar);
  }, [logout, showSnackbar]);

  return children;
}
