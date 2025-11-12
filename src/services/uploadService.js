import uploadApi from '../api/uploadApi';

const uploadService = {
  // uploadMultiple returns a normalized array of URLs
  uploadMultiple: async (files) => {
    if (!files || !files.length) return [];
    try {
      const res = await uploadApi.uploadMultiple(files);
      // normalize several possible shapes: array of strings, { data: [...] }, { urls: [...] }
      if (!res) return [];
      if (Array.isArray(res)) return res;
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.urls)) return res.urls;
      // fallback: if server returns an object with keys that contain urls, try to extract strings
      if (typeof res === 'object') {
        const flat = Object.values(res).flatMap((v) => (Array.isArray(v) ? v : []));
        const strings = flat.filter((x) => typeof x === 'string');
        if (strings.length) return strings;
      }
      return [];
    } catch (err) {
      // rethrow so callers can show snackbar
      throw err;
    }
  }
};

export default uploadService;
