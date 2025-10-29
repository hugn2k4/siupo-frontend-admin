import axiosClient from '../utils/axiosClient';

const productApi = {
  getProducts: (page = 1, size = 50, sortBy = 'id') =>
    axiosClient.get('/products', { params: { page, size, sortBy } }).then((res) => res.data)
};

export default productApi;
