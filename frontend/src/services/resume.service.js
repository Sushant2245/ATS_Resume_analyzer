import api from './api';

export const resumeService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  analyze: async (jobDescription, extractedText, fileName) => {
    const response = await api.post('/resume/analyze', {
      jobDescription,
      extractedText,
      fileName,
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/resume/history');
    return response.data;
  },

  getHistoryById: async (id) => {
    const response = await api.get(`/resume/history/${id}`);
    return response.data;
  },

  tailor: async (jobDescription, extractedText, missingKeywords) => {
    const response = await api.post('/resume/tailor', {
      jobDescription,
      extractedText,
      missingKeywords,
    });
    return response.data;
  },
};

export default resumeService;

