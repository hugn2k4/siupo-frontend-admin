import tableApi from '../api/tableApi';

const tableService = {
  getAllTables: async () => {
    return await tableApi.getAllTables();
  },

  getTableById: async (id) => {
    return await tableApi.getTableById(id);
  },

  createTable: async (data) => {
    return await tableApi.createTable(data);
  },

  updateTable: async (id, data) => {
    return await tableApi.updateTable(id, data);
  },

  deleteTable: async (id) => {
    return await tableApi.deleteTable(id);
  },

  initializeTables: async () => {
    return await tableApi.initializeTables();
  }
};

export default tableService;
