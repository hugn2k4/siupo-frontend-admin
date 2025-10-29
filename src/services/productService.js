import productApi from '../api/productApi';

const productService = {
  getProducts: async (page, size) => {
    try {
      const data = await productApi.getProducts(page, size);
      return data;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to fetch products' };
    }
  }
};
export default productService;
