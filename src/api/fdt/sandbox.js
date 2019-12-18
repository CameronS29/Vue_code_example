import axios from 'axios';
import { response } from '../../utils/api';

const api = axios.create({ baseURL: '/fdt/api/sandbox' });

export default {
  listDuties: params => response(api.get('/duty/', { params })),
  getDuty: id => response(api.get(`/duty/${id}/`)),
  createDuty: data => response(api.post('/duty/', data)),
  updateDuty: ({ id, ...data }) => response(api.patch(`/duty/${id}/`, data)),
  deleteDuty: id => api.delete(`/duty/${id}/`),

  listFlight: params => response(api.get('/flight/', { params })),
  getFlight: id => response(api.get(`/flight/${id}/`)),
  createFlight: data => response(api.post('/flight/', data)),
  updateFlight: ({ id, ...data }) => response(api.patch(`/flight/${id}/`, data)),
  deleteFlight: id => api.delete(`/flight/${id}/`),

  importActual: data => api.post('/import/', data),
};
