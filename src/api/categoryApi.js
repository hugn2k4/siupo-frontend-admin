import axiosClient from '../utils/axiosClient';

const categoryApi = {
  getCategories: () => axiosClient.get('/categories').then((res) => res.data),
  createCategory: (payload) => axiosClient.post('/categories', payload).then((res) => res.data),
  updateCategory: (id, payload) => axiosClient.put(`/categories/${id}`, payload).then((res) => res.data),
  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`).then((res) => res.data)
};

export default categoryApi;
