// src/api/orderApi.js
import axiosClient from '../utils/axiosClient';

const orderApi = {
  // 1. Lấy tất cả đơn hàng (phân trang, lọc trạng thái)
  getAllOrders: (params = {}) => axiosClient.get('/orders/admin', { params }).then((res) => res.data),

  // 2. Lấy chi tiết đơn hàng theo ID
  getOrderDetailById: (orderId) => axiosClient.get(`/orders/admin/${orderId}`).then((res) => res.data),

  // 3. Cập nhật trạng thái đơn hàng
  updateOrderStatus: (orderId, status) =>
    axiosClient.patch(`/orders/admin/${orderId}/status`, null, { params: { status } }).then((res) => res.data),

  // 4. Xóa đơn hàng
  deleteOrder: (orderId) => axiosClient.delete(`/orders/admin/${orderId}`).then((res) => res.data)
};

export default orderApi;
