import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './GlobalContext';
import { SnackbarContext } from './SnackbarProvider';

export const GlobalProvider = ({ children }) => {
  // initialize synchronously from localStorage so initial render reflects login state
  const getInitialState = () => {
    try {
      const userStorage = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      if (userStorage && accessToken) {
        return { user: JSON.parse(userStorage), accessToken, isLogin: true };
      }
    } catch {}
    return { user: null, accessToken: null, isLogin: false };
  };

  const [state, setState] = useState(getInitialState);

  // get snackbar context (may be null if provider not mounted)
  const snackbarCtx = useContext(SnackbarContext);
  const showSnackbar = snackbarCtx ? snackbarCtx.showSnackbar : undefined;

  const setGlobal = (partial) => {
    setState((prev) => {
      const newState = { ...prev, ...partial };
      // persist changes to localStorage (remove keys when falsy)
      if (partial.user !== undefined) {
        if (newState.user) localStorage.setItem('user', JSON.stringify(newState.user));
        else localStorage.removeItem('user');
      }
      if (partial.accessToken !== undefined) {
        if (newState.accessToken) localStorage.setItem('accessToken', newState.accessToken);
        else localStorage.removeItem('accessToken');
      }
      if (partial.isLogin === false) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
      return newState;
    });
  };

  // Listen to storage events from other tabs/windows and sync state
  useEffect(() => {
    const handleStorage = (e) => {
      // storage.clear() sets key === null in some browsers
      if (e.key === null) {
        setState({ user: null, accessToken: null, isLogin: false });
        return;
      }

      if (e.key === 'accessToken') {
        const token = e.newValue;
        if (!token) {
          setState({ user: null, accessToken: null, isLogin: false });
          if (typeof showSnackbar === 'function') {
            showSnackbar({ message: 'You have been logged out', severity: 'info' });
          }
        } else {
          const userStorage = localStorage.getItem('user');
          setState({ user: userStorage ? JSON.parse(userStorage) : null, accessToken: token, isLogin: true });
        }
      }

      if (e.key === 'user') {
        const userVal = e.newValue;
        if (!userVal) {
          setState((prev) => ({ ...prev, user: null }));
        } else {
          try {
            const u = JSON.parse(userVal);
            setState((prev) => ({ ...prev, user: u }));
          } catch {}
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [showSnackbar]);

  const logout = () => {
    setState({ user: null, accessToken: null, isLogin: false });
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  return <GlobalContext.Provider value={{ ...state, setGlobal, logout }}>{children}</GlobalContext.Provider>;
};
