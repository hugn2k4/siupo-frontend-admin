import authApi from '../api/authApi';

export const authService = {
  login: async (data) => {
    const res = await authApi.login(data);

    if (res.success && res.data) {
      const { accessToken, user } = res.data;
      const userObj = typeof user === 'string' ? JSON.parse(user) : user;

      if (!userObj || (userObj.role || '').toString().toUpperCase() !== 'ADMIN') {
        return { success: false, message: 'You do not have admin access' };
      }

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    }

    return res;
  },

  logout: () => {
    return authApi.logout();
  }
};

export default authService;
