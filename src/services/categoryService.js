import categoryApi from '../api/categoryApi';

const categoryService = {
  getAll: async () => {
    try {
      const res = await categoryApi.getCategories();
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to fetch categories' };
    }
  },
  create: async (payload) => {
    try {
      const res = await categoryApi.createCategory(payload);
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to create category' };
    }
  },
  update: async (id, payload) => {
    try {
      const res = await categoryApi.updateCategory(id, payload);
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to update category' };
    }
  },
  delete: async (id) => {
    try {
      const res = await categoryApi.deleteCategory(id);
      return res;
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to delete category' };
    }
  }
};

export default categoryService;
