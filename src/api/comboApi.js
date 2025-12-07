import axiosClient from '../utils/axiosClient';

const comboApi = {
  // Get all combos
  getAllCombos: (availableOnly = false) => {
    const params = availableOnly ? { availableOnly: true } : {};
    return axiosClient.get('/combos', { params }).then((res) => res.data);
  },

  // Get combo by ID
  getComboById: (id) => {
    return axiosClient.get(`/combos/${id}`).then((res) => res.data);
  },

  // Create new combo
  createCombo: (payload) => {
    return axiosClient.post('/combos', payload).then((res) => res.data);
  },

  // Update combo
  updateCombo: (id, payload) => {
    return axiosClient.put(`/combos/${id}`, payload).then((res) => res.data);
  },

  // Delete combo
  deleteCombo: (id) => {
    return axiosClient.delete(`/combos/${id}`).then((res) => res.data);
  },

  // Toggle combo status
  toggleComboStatus: (id) => {
    return axiosClient.put(`/combos/${id}/status`).then((res) => res.data);
  }
};

export default comboApi;
