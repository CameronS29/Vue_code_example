import axios from 'axios';
import { response } from '../../utils/api';

const reportsApi = axios.create({
  baseURL: '/reports/api',
});

export default {
  onTimePerformance: filters =>
    response(reportsApi.get('/ontime', { params: filters })),

  t100: (year, month) =>
    response(reportsApi.get(`/t100/${year}-${month}/`)),

  getCommunitiesReport: ({ subtype, ...filters }) =>
    response(reportsApi.get(`/ontime/${subtype}`, { params: filters })),

  getFilteredResults: filters =>
    response(reportsApi.get('/ontime/route/', { params: filters })),

  getDelays: filters => response(reportsApi.get('/delay', { params: filters })),
};
