import axiosClient from '../utils/axiosClient';

const tagApi = {
  // Get all tags
  getAllTags: async () => {
    const response = await axiosClient.get('/tags');
    return response.data;
  },

  // Get tag by id
  getTagById: async (id) => {
    const response = await axiosClient.get(`/tags/${id}`);
    return response.data;
  },

  // Create new tag
  createTag: async (data) => {
    const response = await axiosClient.post('/tags', data);
    return response.data;
  },

  // Update tag
  updateTag: async (id, data) => {
    const response = await axiosClient.put(`/tags/${id}`, data);
    return response.data;
  },

  // Delete tag
  deleteTag: async (id) => {
    const response = await axiosClient.delete(`/tags/${id}`);
    return response.data;
  }
};

export default tagApi;
