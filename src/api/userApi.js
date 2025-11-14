import axiosClient from '../utils/axiosClient';

const userApi = {
  // Lấy thông tin user hiện tại
  getCurrentUser: () => axiosClient.get('/users/customer').then((res) => res.data),

  // Cập nhật thông tin user
  updateUser: (data) => axiosClient.put('/users/customer', data).then((res) => res.data),

  // Đổi mật khẩu
  changePassword: (data) => axiosClient.put('/users/customer/changepassword', data).then((res) => res.data),

  // Lấy danh sách tất cả customer (Admin only)
  getAllCustomers: () => axiosClient.get('/users/customers').then((res) => res.data),

  // Cập nhật trạng thái customer theo ID (Admin only)
  updateCustomerStatus: (customerId, status) => axiosClient.put(`/users/customers/${customerId}/status`, { status }).then((res) => res.data)
};

export default userApi;
