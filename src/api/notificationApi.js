import axiosClient from '../utils/axiosClient';

const notificationApi = {
  // Admin APIs
  // Lấy tất cả thông báo (Admin)
  getAllNotifications: () => axiosClient.get('/notifications/admin').then((res) => res.data),

  // Tạo thông báo cho 1 user hoặc tất cả user (Admin)
  createNotification: (data) => axiosClient.post('/notifications/admin', data).then((res) => res.data),

  // Customer APIs
  // Lấy thông báo của user hiện tại
  getMyNotifications: () => axiosClient.get('/notifications/customer').then((res) => res.data),

  // Đánh dấu đã đọc
  markAsRead: (notificationId) => axiosClient.put(`/notifications/customer/${notificationId}/read`).then((res) => res.data),

  // Xóa thông báo
  deleteNotification: (notificationId) => axiosClient.delete(`/notifications/customer/${notificationId}`).then((res) => res.data)
};

export default notificationApi;
