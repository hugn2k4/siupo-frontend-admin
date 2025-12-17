import tagApi from '../api/tagApi';

const tagService = {
  getAllTags: async () => {
    try {
      const response = await tagApi.getAllTags();
      return response;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  getTagById: async (id) => {
    try {
      const response = await tagApi.getTagById(id);
      return response;
    } catch (error) {
      console.error('Error fetching tag:', error);
      throw error;
    }
  },

  createTag: async (data) => {
    try {
      const response = await tagApi.createTag(data);
      return response;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },

  updateTag: async (id, data) => {
    try {
      const response = await tagApi.updateTag(id, data);
      return response;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      const response = await tagApi.deleteTag(id);
      return response;
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }
};

export default tagService;
