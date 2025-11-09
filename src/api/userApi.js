import axiosClient from '../utils/axiosClient';

const userApi = {
  changePassword: (data) => axiosClient.put('/users/customer/changepassword', data).then((res) => res.data)
};

export default userApi;
