import axiosClient from '../utils/axiosClient';

const voucherApi = {
  // Get all vouchers with pagination (Admin)
  getAll: (params) => {
    return axiosClient.get('/vouchers/admin', { params });
  },

  // Get voucher by ID (Admin)
  getById: (id) => {
    return axiosClient.get(`/vouchers/admin/${id}`);
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
