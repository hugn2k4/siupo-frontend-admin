import productApi from '../api/productApi';

const productService = {
  getProducts: async (page, size) => {
    try {
      const data = await productApi.getProducts(page, size);
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
  }
};
export default productService;
