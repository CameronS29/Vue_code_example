import axios from 'axios';
import { response } from 'utils/api';

const api = axios.create({
  baseURL: '/fdt/api',
});

export default {
  listPilots: () => response(api.get('/pilot/')),
  getPilot: (id, timestamp = null) => response(api.get(`/pilot/${id}/`, { params: { timestamp } })),
  deletePilot: id => response(api.delete(`/pilot/${id}/`)),

  pushPilot(data) {
    const action = data.id
      ? data => api.put(`/pilot/${data.id}/`, data)
      : data => api.post('/pilot/', data);
    return response(action(data));
  },
};
