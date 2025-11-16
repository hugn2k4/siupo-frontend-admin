import axiosClient from '../utils/axiosClient';

const orderApi = {
  // Get all orders with pagination and optional status filter
  getOrders: (opts = {}) => {
    const { page = 0, size = 10, sortBy = 'createdAt,desc', status } = opts;
    const params = { page, size, sort: sortBy.split(',') };
    if (status) params.status = status;
    return axiosClient.get('/orders/admin', { params }).then((res) => res.data);
  },

  // Get order detail by ID
  getOrderDetail: (id) => axiosClient.get(`/orders/admin/${id}`).then((res) => res.data),

  // Update order status
  updateOrderStatus: (id, status) => axiosClient.patch(`/orders/admin/${id}/status`, null, { params: { status } }).then((res) => res.data),

  // Delete order (only canceled orders)
  deleteOrder: (id) => axiosClient.delete(`/orders/admin/${id}`).then((res) => res.data)
};

export default orderApi;
