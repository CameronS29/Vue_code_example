import axios from 'axios';
import qs from 'qs';
import createTableApi from './factory/table';
import { response } from '../utils/api';
import { response as offlineResponse } from '../utils/offline';

export const PATCH_FLIGHT_LOG_STORE_KEY = id => `PATCH_FLIGHT_LOG_${id}_STORE_KEY`;
const flightLogApi = axios.create({
  baseURL: '/flightlog/api',
  paramsSerializer: qs.stringify,
});

export default {
  getFilteredLogs: (data, size, page) =>
    response(flightLogApi.get('/', {
      params: {
        ordering: '-actual_datetime_out',
        ...data,
        size,
        page,
      },
    })),

  getLog: id => response(flightLogApi.get(`/${id}/`)),
  getFeatureLog: id => response(flightLogApi.get(`/${id}/feature/`)),

  getFlightLog: id => response(flightLogApi.get(`/flightlog/${id}/`)),
  patchFlightlog: (id, data, state) =>
    offlineResponse({
      options: { method: 'patch', url: `/flightlog/api/flightlog/${id}/`, data },
      key: PATCH_FLIGHT_LOG_STORE_KEY(id),
      state,
    }),

  getNightInfo: data => response(axios.post('/api/flight_log/additional/', data)),
  changeDiversionType: data => response(axios.post('/flight/api/change-diversion-type/', data)),
  changeFlightAirport: data => response(axios.post('/flight/api/flight-airport/', data)),
  copyFlight: data => response(axios.post('/flight/api/copy-flight/', data)),
  forceSync: id => response(axios.get(`/flightlog/${id}/reschedule/?newapp=1`)),
};

export const lastCompletedApi = createTableApi('/flightlog/api/last_completed_manifest/');
