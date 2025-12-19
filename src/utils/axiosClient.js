import axios from 'axios';
import { API_BASE_URL, DEFAULT_HEADERS } from '../config';
import { handleSessionExpired } from './authUtils';

// ----- Khởi tạo axios instance -----
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: DEFAULT_HEADERS,
  withCredentials: true
});

// ----- Sinh ID cho từng request -----
let requestId = 0;
function generateRequestId() {
  return ++requestId;
}

// ----- REQUEST INTERCEPTOR -----
axiosClient.interceptors.request.use(
  (config) => {
    // Gắn ID cho request
    const reqId = generateRequestId();
    config.headers['X-Request-ID'] = reqId.toString();

    // Gắn token nếu có
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request
    console.log(`🔹 [${reqId}] Request:`, {
      url: config.url,
      method: config.method?.toUpperCase(),
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ----- Biến kiểm soát refresh token -----
let isRefreshing = false;
let isSessionExpired = false; // Flag để tránh gọi handleSessionExpired nhiều lần
let subscribers = [];

function onAccessTokenFetched(newToken) {
  subscribers.forEach((cb) => cb(newToken));
  subscribers = [];
}

function addSubscriber(callback) {
  subscribers.push(callback);
}

// ----- RESPONSE INTERCEPTOR -----
axiosClient.interceptors.response.use(
  (response) => {
    const reqId = response.config.headers['X-Request-ID'] || '?';

    // Log response
    console.log(`✅ [${reqId}] Response:`, {
      url: response.config.url,
      status: response.status,
      data: response.data
    });

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const reqId = originalRequest?.headers?.['X-Request-ID'] || '?';

    // ----- Handle 401 (Unauthorized) + Refresh token -----
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip retry for refresh-token endpoint itself to avoid infinite loop
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        console.error(`❌ [${reqId}] Refresh token expired - Logging out`);
        isRefreshing = false;
        subscribers = []; // Clear all waiting requests

        // Only handle session expired once
        if (!isSessionExpired) {
          isSessionExpired = true;
          handleSessionExpired();
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addSubscriber((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log(`🔄 [${reqId}] Refreshing token...`);
        const res = await axiosClient.post('/auth/refresh-token');

        const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token received');
        }

        localStorage.setItem('accessToken', newAccessToken);
        console.log(`✅ [${reqId}] Token refreshed successfully`);

        onAccessTokenFetched(newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        subscribers = []; // Clear all waiting requests
        console.error(`❌ [${reqId}] Refresh token failed - Session expired`, refreshError);

        // Only handle session expired once
        if (!isSessionExpired) {
          isSessionExpired = true;
          handleSessionExpired();
        }
        return Promise.reject(refreshError);
      }
    }

    // Log lỗi giống format response thành công
    console.error(`❌ [${reqId}] Response:`, {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status || 'ERR',
      message: error.message
    });

    return Promise.reject(error);
  }
);

export default axiosClient;
