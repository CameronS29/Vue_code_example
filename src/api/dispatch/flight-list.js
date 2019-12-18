import axios from 'axios';
import qs from 'query-string';

import { response } from '../../utils/api';

const dispatchApi = axios.create({
  baseURL: '/dispatch/api',
  paramsSerializer: params => qs.stringify(params),
});
const flightsApi = axios.create({
  baseURL: '/flight/api',
});

export default {
  getFilteredResults: params => response(
    flightsApi.get('/full/', {
      params,
      paramsSerializer: params => qs.stringify(params),
    }),
  ),
  getCSVStatus: params => response(flightsApi.post('/full/csv_download/', params)),
  getCSVURL: task_id => response(flightsApi.get(`/full/csv_download/?task_id=${task_id}`)),
  fetchAirportInfo: airportIds => response(dispatchApi.get('/airport_info/', { params: { airports: airportIds } })),

  getFlightStatuses: flight => response(flightsApi.get(`/flight/${flight}/statuses/`)),
  getOperations: () => response(dispatchApi.get('/operations/')),
  getOperationUnder: () => response(dispatchApi.get('/operating-under/')),
  getFlightNumbers: () => response(flightsApi.get('/numbers/')),
  async sync(params){
    return await response(flightsApi.post('/flight/sync/', params));
  },
  getFlight: (id) => response(flightsApi.get(`/flight/${id}/`)),
  syncTaskResult: (task_id) => response(flightsApi.get(`/flight/sync/?task_id=${task_id}`)),
  externalSyncCommits: (sync_id) => response(flightsApi.get(`/external-sync/${sync_id}/commits/`)),
  externalSyncList: () => response(flightsApi.get('/external-sync/')),
  getAvailableOfficialCodes: () => response(flightsApi.get('/official-code/')),
  changeFlightStatus: data => response(flightsApi.post('/change-status/', data)),
  changeFlightBatchStatus: data => response(flightsApi.post('/change-status/batch/', data)),
};
