import axiosClient from '../utils/axiosClient';

const voucherApi = {
  // Get all vouchers with pagination
  getAll: (params) => {
    return axiosClient.get('/vouchers', { params });
  },

  // Get voucher by ID
  getById: (id) => {
    return axiosClient.get(`/vouchers/${id}`);
  },

  // Create new voucher
  create: (data) => {
    return axiosClient.post('/vouchers', data);
  },

  // Update voucher
  update: (id, data) => {
    return axiosClient.put(`/vouchers/${id}`, data);
  },

  // Delete voucher (soft delete)
  delete: (id) => {
    return axiosClient.delete(`/vouchers/${id}`);
  },

  // Toggle voucher status (ACTIVE/INACTIVE)
  toggleStatus: (id) => {
    return axiosClient.patch(`/vouchers/${id}/toggle-status`);
  }
};

export default voucherApi;
