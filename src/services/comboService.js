import comboApi from '../api/comboApi';

const comboService = {
  getAll: async (availableOnly = false) => {
    try {
      const response = await comboApi.getAllCombos(availableOnly);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching combos:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await comboApi.getComboById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching combo:', error);
      throw error;
    }
  },

  create: async (comboData) => {
    try {
      const response = await comboApi.createCombo(comboData);
      return response.data;
    } catch (error) {
      console.error('Error creating combo:', error);
      throw error;
    }
  },

  update: async (id, comboData) => {
    try {
      const response = await comboApi.updateCombo(id, comboData);
      return response.data;
    } catch (error) {
      console.error('Error updating combo:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await comboApi.deleteCombo(id);
      return response;
    } catch (error) {
      console.error('Error deleting combo:', error);
      throw error;
    }
  },

  toggleStatus: async (id) => {
    try {
      const response = await comboApi.toggleComboStatus(id);
      return response.data;
    } catch (error) {
      console.error('Error toggling combo status:', error);
      throw error;
    }
  }
};

export default comboService;
