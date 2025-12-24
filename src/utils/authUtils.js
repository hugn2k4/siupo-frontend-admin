/**
 * Authentication utility functions for Admin
 * Handles logout and session expiration
 */

let globalLogoutHandler = null;
let globalShowSnackbar = null;
let isSessionExpiring = false; // Flag to prevent multiple calls

/**
 * Register global handlers for logout and notifications
 * This should be called once in the app initialization
 */
export const registerAuthHandlers = (logout, showSnackbar) => {
  globalLogoutHandler = logout;
  globalShowSnackbar = showSnackbar;
  console.log('✅ Auth handlers registered successfully');
};

/**
 * Handle session expiration
 * - Clear all tokens from localStorage
 * - Show notification
 * - Trigger logout in global state
 * - Redirect to login page
 */
export const handleSessionExpired = () => {
  // Prevent multiple calls
  if (isSessionExpiring) {
    console.log('⏭️ handleSessionExpired already in progress, skipping...');
    return;
  }

  isSessionExpiring = true;
  console.log('🚪 handleSessionExpired called');

  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  console.log('🗑️ Tokens cleared from localStorage');

  // Show notification if available
  const notificationDuration = 2000; // 2 seconds
  if (globalShowSnackbar) {
    console.log('📢 Showing session expired notification');
    globalShowSnackbar({ message: 'Your session has expired. Please login again.', severity: 'warning', duration: notificationDuration });
  } else {
    console.warn('⚠️ globalShowSnackbar not available');
  }

  // Trigger logout if available
  if (globalLogoutHandler) {
    console.log('👋 Calling global logout handler');
    globalLogoutHandler();
  } else {
    console.warn('⚠️ globalLogoutHandler not available');
  }

  // Redirect to login page after notification duration
  console.log(`🔐 Redirecting to login page in ${notificationDuration}ms...`);
  setTimeout(() => {
    window.location.href = '/pages/login';
  }, notificationDuration);
};

/**
 * Manual logout with notification
 */
export const handleLogout = (message = 'Logged out successfully') => {
  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Show notification if available
  if (globalShowSnackbar) {
    globalShowSnackbar({ message, severity: 'success', duration: 3000 });
  }

  // Trigger logout if available
  if (globalLogoutHandler) {
    globalLogoutHandler();
  }

  // Redirect to login page
  window.location.href = '/pages/login';
};
