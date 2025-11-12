import axiosClient from '../utils/axiosClient';

const productApi = {
  // Search endpoint that supports filtering: name, categoryIds (comma-separated), minPrice, maxPrice
  getProducts: (opts = {}) => {
    const { page = 0, size = 15, sortBy = 'id,asc', name, categoryIds, minPrice, maxPrice } = opts;
    const params = { page, size, sortBy };
    if (name) params.name = name;
    if (categoryIds) params.categoryIds = categoryIds;
    if (minPrice != null) params.minPrice = minPrice;
    if (maxPrice != null) params.maxPrice = maxPrice;
    return axiosClient.get('/products/search', { params }).then((res) => res.data);
  },
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`).then((res) => res.data),
  changeStatusProduct: (id) => axiosClient.put(`/products/${id}/status`).then((res) => res.data),
  createProduct: (payload) => {
    // payload may be FormData or JSON
    return axiosClient.post('/products', payload).then((res) => res.data);
  },
  updateProduct: (id, payload) => {
    return axiosClient.put(`/products/${id}`, payload).then((res) => res.data);
  }
};

export default productApi;
