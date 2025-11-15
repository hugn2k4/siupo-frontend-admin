import axiosClient from '../utils/axiosClient';

const bannerApi = {
  getAll: () => {
    return axiosClient.get('/banners');
  },

  getById: (id) => {
    return axiosClient.get(`/banners/${id}`);
  },

  create: (data) => {
    return axiosClient.post('/banners', data);
  },

  update: (id, data) => {
    return axiosClient.put(`/banners/${id}`, data);
  },

  delete: (id) => {
    return axiosClient.delete(`/banners/${id}`);
  }
};

export default bannerApi;
