import axiosClient from '../utils/axiosClient';

const uploadApi = {
  uploadMultiple: (files) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return axiosClient.post('/upload/multiple', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);
  },
  uploadSingle: (file) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post('/upload/single', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data);
  }
};

export default uploadApi;
