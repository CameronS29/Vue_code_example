import axios from 'axios';
import qs from 'query-string';
import { response } from '../../utils/api';

const wbApi = axios.create({
  baseURL: '/wb/api',
  paramsSerializer: qs.stringify,
});

export default {
  getWBLog: id => response(wbApi.get(`/${id}/`)),
  getCalculations: id => response(wbApi.get(`/${id}/calculations/`)),
  getValidations: id => response(wbApi.get(`/${id}/validation/`)),
  markWBLogReady: id => response(wbApi.post(`/${id}/mark-ready/`)),
  sendPDF: id => response(wbApi.post(`/${id}/send-pdf/`)),
  deleteWBLog: id => response(wbApi.delete(`/${id}/`)),
  getCGLimits: aircraftType => response(wbApi.get(`/${aircraftType}/cg-limits/`)),
  getWBLogPassengers: id => response(wbApi.get(`/${id}/passengers/`)),
  pushWBLog(data) {
    const action = data.id
      ? () => wbApi.put(`/${data.id}/`, data)
      : () => wbApi.post('/create/', data);
    return response(action());
  },
  patchWBLog: (id, data) => response(wbApi.patch(`/${id}/`, data)),
  patchWBLock: (id, data) => response(wbApi.patch(`/${id}/lock/`, data)),
  pushSeatNumber: (wbLog, data) => response(wbApi.post(`/${wbLog}/seats/`, data)),
  createPassengers: wbLog => response(wbApi.post(`/${wbLog}/passengers/create/`)),
  pushPassenger: data => response(wbApi.put(`/passenger/${data.id}/`, data)),
  fetchVidecomPassengers: id => response(wbApi.post(`${id}/fetch_videcom_names/`)),

  fetchArms: params => response(wbApi.get('/arms/', { params })),
  extractArms: aircraft => response(wbApi.post('/arms/', { aircraft })),
  patchArm: ({ id, value }) => response(wbApi.patch(`/arms/${id}/`, { value })),

  fetchFuelLoadings: params => response(wbApi.get('/fuel-loadings/', { params })),
  patchFuelLoad: ({ id, data }) => response(wbApi.patch(`/fuel-loadings/${id}/`, data)),
  deleteFuelLoad: id => response(wbApi.delete(`/fuel-loadings/${id}/`)),
  addFuelLoad: typeId => response(wbApi.post('/fuel-loadings/', {
    aircraft_type: typeId,
    fuel_weight: 0,
    moment: 0,
  })),

  fetchEnvelope: params => response(wbApi.get('/cg/', { params })),
  patchEnvelope: ({ id, data }) => response(wbApi.patch(`/cg/${id}/`, data)),
  deleteEnvelope: id => response(wbApi.delete(`/cg/${id}/`)),
  addEnvelope: typeId => response(wbApi.post('/cg/', {
    aircraft_type: typeId,
    center_gravity: 0,
    center_gravity_weight: 0,
    trim_weight: 0,
    zero_fuel: 0,
  })),

  // Sortable table endpoint
  getFilteredResults: params => response(wbApi.get('/logs/', { params })),
};

