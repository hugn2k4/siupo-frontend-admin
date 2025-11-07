import axiosClient from '../utils/axiosClient';

const managePlaceTable = {
  // ============= CUSTOMER BOOKINGS =============

  getAllCustomerBookings: async () => {
    const response = await axiosClient.get('/manage/place-tables/customers');
    return response.data;
  },

  getCustomerBookingById: async (id) => {
    const response = await axiosClient.get(`/manage/place-tables/customers/${id}`);
    return response.data;
  },

  getCustomerBookingsByStatus: async (status) => {
    const response = await axiosClient.get(`/manage/place-tables/customers/status/${status}`);
    return response.data;
  },

  getCustomerBookingsByDateRange: async (startDate, endDate) => {
    const response = await axiosClient.get('/manage/place-tables/customers/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  confirmCustomerBooking: async (id, note = null) => {
    const response = await axiosClient.patch(`/manage/place-tables/customers/${id}/confirm`, note ? { note } : {});
    return response.data;
  },

  denyCustomerBooking: async (id, note) => {
    if (!note || note.trim() === '') {
      throw new Error('Vui lòng nhập lý do từ chối');
    }
    const response = await axiosClient.patch(`/manage/place-tables/customers/${id}/deny`, { note });
    return response.data;
  },

  completeCustomerBooking: async (id, note = null) => {
    const response = await axiosClient.patch(`/manage/place-tables/customers/${id}/complete`, note ? { note } : {});
    return response.data;
  },

  updateCustomerBookingStatus: async (id, status, note = null) => {
    if (status === 'denied' && (!note || note.trim() === '')) {
      throw new Error('Vui lòng nhập lý do từ chối');
    }
    const response = await axiosClient.patch(`/manage/place-tables/customers/${id}/status`, { status, note });
    return response.data;
  },

  countCustomerBookingsByStatus: async (status) => {
    const response = await axiosClient.get(`/manage/place-tables/customers/count/status/${status}`);
    return response.data.count;
  },

  resendCustomerConfirmation: async (id) => {
    const response = await axiosClient.post(`/manage/place-tables/customers/${id}/resend-confirmation`);
    return response.data;
  },

  // ============= GUEST BOOKINGS =============

  getAllGuestBookings: async () => {
    const response = await axiosClient.get('/manage/place-tables/guests');
    return response.data;
  },

  getGuestBookingById: async (id) => {
    const response = await axiosClient.get(`/manage/place-tables/guests/${id}`);
    return response.data;
  },

  getGuestBookingsByStatus: async (status) => {
    const response = await axiosClient.get(`/manage/place-tables/guests/status/${status}`);
    return response.data;
  },

  getGuestBookingsByPhone: async (phoneNumber) => {
    const response = await axiosClient.get(`/manage/place-tables/guests/phone/${phoneNumber}`);
    return response.data;
  },

  getGuestBookingsByDateRange: async (startDate, endDate) => {
    const response = await axiosClient.get('/manage/place-tables/guests/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  confirmGuestBooking: async (id, note = null) => {
    const response = await axiosClient.patch(`/manage/place-tables/guests/${id}/confirm`, note ? { note } : {});
    return response.data;
  },

  denyGuestBooking: async (id, note) => {
    if (!note || note.trim() === '') {
      throw new Error('Vui lòng nhập lý do từ chối');
    }
    const response = await axiosClient.patch(`/manage/place-tables/guests/${id}/deny`, { note });
    return response.data;
  },

  completeGuestBooking: async (id, note = null) => {
    const response = await axiosClient.patch(`/manage/place-tables/guests/${id}/complete`, note ? { note } : {});
    return response.data;
  },

  updateGuestBookingStatus: async (id, status, note = null) => {
    if (status === 'denied' && (!note || note.trim() === '')) {
      throw new Error('Vui lòng nhập lý do từ chối');
    }
    const response = await axiosClient.patch(`/manage/place-tables/guests/${id}/status`, { status, note });
    return response.data;
  },

  // ============= COMBINED STATISTICS =============

  getBookingStatistics: async () => {
    const response = await axiosClient.get('/manage/place-tables/statistics');
    return response.data;
  },

  getTodayBookings: async () => {
    const response = await axiosClient.get('/manage/place-tables/today');
    return response.data;
  }
};

export default managePlaceTable;
