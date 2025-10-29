import axiosClient from '../utils/axiosClient';

const authApi = {
  login: (data) => axiosClient.post('/auth/login', data).then((response) => response.data),

  logout: () => axiosClient.post('/api/logout').then((response) => response.data)
};

export default authApi;
