import productApi from '../api/productApi';

const productService = {
  getProducts: async (page = 0, size = 15, filters = {}) => {
    try {
      const opts = { page, size, ...filters };
      const data = await productApi.getProducts(opts);
      return data;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to fetch products' };
    }
  },
  deleteProduct: async (id) => {
    try {
      const res = await productApi.deleteProduct(id);
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to delete product' };
    }
  },
  changStatusProduct: async (id) => {
    try {
      const res = await productApi.changeStatusProduct(id);
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to change product status' };
    }
  },
  createProduct: async (payload) => {
    try {
      const res = await productApi.createProduct(payload);
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to create product' };
    }
  },
  updateProduct: async (id, payload) => {
    try {
      const res = await productApi.updateProduct(id, payload);
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to update product' };
    }
  }
};
export default productService;
