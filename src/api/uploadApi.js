import axiosClient from '../utils/axiosClient';

const uploadApi = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return axiosClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default uploadApi;
