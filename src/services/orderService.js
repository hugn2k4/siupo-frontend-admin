import orderApi from 'api/orderApi';

const orderService = {
  getOrders: async (opts = {}) => {
    try {
      const response = await orderApi.getOrders(opts);
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getOrderDetail: async (id) => {
    try {
      const response = await orderApi.getOrderDetail(id);
      return response;
    } catch (error) {
      console.error('Error fetching order detail:', error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await orderApi.updateOrderStatus(id, status);
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await orderApi.deleteOrder(id);
      return response;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

export default orderService;
