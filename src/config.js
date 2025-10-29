export const DASHBOARD_PATH = '/sample-page';

const config = {
  fontFamily: `'Roboto', sans-serif`,
  borderRadius: 8
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

export default config;
