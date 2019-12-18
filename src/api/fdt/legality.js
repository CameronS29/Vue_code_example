import axios from 'axios';
import { response } from '../../utils/api';

const api = axios.create({ baseURL: '/fdt/api' });

export default {
  fetchLegality: (pilot, params = {}) => response(api.get(`/pilot/${pilot}/legality/`, { params })),

  listDuties: params => response(api.get('/duty/', { params })),
  getDuty: id => response(api.get(`/duty/${id}/`)),
  createDuty: data => response(api.post('/duty/', data)),
  updateDuty: ({ id, ...data }) => response(api.patch(`/duty/${id}/`, data)),
  deleteDuty: id => api.delete(`/duty/${id}/`),

  listOCF: params => response(api.get('/ocf/', { params })),
  getOCF: id => response(api.get(`/ocf/${id}/`)),
  createOCF: data => response(api.post('/ocf/', data)),
  updateOCF: ({ id, ...data }) => response(api.patch(`/ocf/${id}/`, data)),
  deleteOCF: id => api.delete(`/ocf/${id}/`),
  createOCFInBulk: payload => response(api.post('/ocf/bulk_create/', payload)),

  confirmFDT: data => response(api.post('/confirmation/', data)),
  removeConfirm: data => response(api.post('/delete-confirmation/', data)),

  perFlight: flights => response(api.post('/legality/per-flight/', { flights })),
};

