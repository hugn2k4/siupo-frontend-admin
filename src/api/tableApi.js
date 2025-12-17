import axiosClient from '../utils/axiosClient';

const tableApi = {
  getAllTables: () => axiosClient.get('/tables').then((res) => res.data),

  getTableById: (id) => axiosClient.get(`/tables/${id}`).then((res) => res.data),

  createTable: (payload) => axiosClient.post('/tables', payload).then((res) => res.data),

  updateTable: (id, payload) => axiosClient.put(`/tables/${id}`, payload).then((res) => res.data),

  deleteTable: (id) => axiosClient.delete(`/tables/${id}`).then((res) => res.data),

  initializeTables: () => axiosClient.post('/tables/initialize').then((res) => res.data)
};

export default tableApi;
