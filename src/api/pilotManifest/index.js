import { response } from '../../utils/api';
import { response as offlineResponse } from '../../utils/offline';
import createTableApi from '../factory/table';
import APIs from '../axiosAPIs';

const { dispatchApi, manifestApi, flightlogApi } = APIs;

export const PATCH_MANIFEST_STORE_KEY = id => `PATCH_MANIFEST_${id}_STORE_KEY`;

export default {
  pushManifest(data) {
    const action = data.id
      ? () => manifestApi.put(`/${data.id}/`, data)
      : () => manifestApi.post('/create/', data);
    return response(action());
  },
  patchManifest: (id, data, state) => offlineResponse({
    options: { method: 'patch', url: `/${id}/`, data: data },
    api: 'manifestApi',
    key: PATCH_MANIFEST_STORE_KEY(id),
    state
  }),
  updateManifestNumber: (id, number) => response(manifestApi.patch(`/${id}/number`, {number})),
  getManifest: id => response(manifestApi.get(`/${id}/`)),
  getAllProfiles: () => response(manifestApi.get("/profiles/")),
  getAirports: (params) => response(dispatchApi.get('/airport/', params)),
  createLog: (data) => response(manifestApi.post('/log/create/', data)),
  completeLog: (data) => response(manifestApi.post('/log/complete/', data)),
  getFlight: (id) => response(dispatchApi.get(`/flights/${id}/`)),
  createFlight: (data) => response(dispatchApi.post('/flights/', data)),
  patchFlight: (id, data) => response(dispatchApi.patch(`/flights/${id}/`, data)),
  getFlightOptions: () => response(dispatchApi('/options/')),

  getDuty: id => response(manifestApi.get(`/duties/${id}/`)),
  patchDuty: (id, data) => response(manifestApi.patch(`/duties/${id}/`, data)),
  getSunSetRiseInfo: (airport, date) => response(manifestApi.get(`/sun_rise_set_info/?airport=${airport}&date=${date}`)),

  validateLog: id => response(flightlogApi.get(`flightlog/${id}/valid/`)),
};

export const flightsApi = createTableApi('/dispatch/api/flights/');
