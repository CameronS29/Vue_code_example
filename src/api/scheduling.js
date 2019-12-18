import axios from 'axios';
import qs from 'query-string';
import { response } from 'utils/api';
import createTableApi from './factory/table';

export const pairingTemplateGroups = createTableApi('/fdt/api/scheduling/shell-groups/');
export const reserveTemplatesTableApi = createTableApi('/fdt/api/scheduling/shift-templates/');
export const reserveShiftsTableApi = createTableApi('/fdt/api/scheduling/unpaired-shifts/');
export const pairings = createTableApi('/fdt/api/scheduling/pairs/');

export const SCHEDULING_API_BASE = '/fdt/api/scheduling';
const schedulingApi = axios.create({
  baseURL: SCHEDULING_API_BASE,
  paramsSerializer: qs.stringify,
});
const fdtApi = axios.create({
  baseURL: '/fdt/api/',
  paramsSerializer: qs.stringify,
});
const accountApi = axios.create({
  baseURL: '/account/api/',
  paramsSerializer: qs.stringify,
});

export const openTimeApi = {
  getFilteredResults: params => (
    response(fdtApi.get('/open-time/', { params }))
  ),
};

export const crewCurrency = {
  patch({ key, value, pilotId }) {
    return response(accountApi.patch(`pilot/${pilotId}/currency/`, { [key]: value }));
  },
  fetch(ids) {
    return response(accountApi.get('pilot/', { params: { ids } }));
  },
  fetchTypes() {
    return response(accountApi.get('currency-type/'));
  },
  fetchGroups() {
    return response(accountApi.get('currency-group/'));
  },
};

export default {
  getAssignedFlightStatus({ revision, ...filters }) {
    return response(schedulingApi.get(`/assignment/days-unassigned/${revision}/`, { params: filters }));
  },

  getAssignedFlights({ revision, ...filters }) {
    return response(schedulingApi.get(`/assignment/flights/${revision}/`, { params: filters }));
  },

  getAssignedPairs({ revision, ...filters }) {
    return response(schedulingApi.get(`/assignment/pairs/${revision}/`, { params: filters }));
  },

  postReserveShift(payload) {
    return response(schedulingApi.post('/unpaired-shifts/', payload));
  },

  patchReserveShift(payload) {
    return response(schedulingApi.patch(`/unpaired-shifts/${payload.id}/`, payload));
  },

  deleteReserveShift(id) {
    return response(schedulingApi.delete(`/unpaired-shifts/${id}/`));
  },

  postReserveTemplate(payload) {
    return response(schedulingApi.post('/shift-templates/', payload));
  },

  patchReserveTemplate(payload) {
    return response(schedulingApi.put(`/shift-templates/${payload.id}/`, payload));
  },

  getShiftTemplateChanges(id) {
    return response(schedulingApi.get(`/shift-templates/${id}/affect/`));
  },

  applyShiftTemplateChanges(id) {
    return response(schedulingApi.post(`/shift-templates/${id}/apply/`));
  },

  deleteReserveTemplate(id) {
    return response(schedulingApi.delete(`/shift-templates/${id}/`));
  },

  postDayOffType(payload) {
    return response(schedulingApi.post('/off-reasons/', payload));
  },

  deleteDayOffType(id) {
    return response(schedulingApi.delete(`/off-reasons/${id}/`));
  },

  patchDayOffType(payload) {
    return response(schedulingApi.put(`/off-reasons/${payload.id}/`, payload));
  },

  getDayOffTypes() {
    return response(schedulingApi.get('/off-reasons/'));
  },

  dayOffMultiAssign(revisionId, payload) {
    return response(schedulingApi.post(`/off-reasons/${revisionId}/multi-assign/`, payload));
  },

  async pairingTemplatesByGroupId(id) {
    const data = await response(schedulingApi.get(`/shell-groups/${id}/shells/`));
    return data.results;
  },

  pairingTemplateAffect(id) {
    return response(schedulingApi.get(`/shells/${id}/affect/`));
  },

  getRevisionHasChanges(id) {
    return response(schedulingApi.get(`/revisions/${id}/has-changes/`));
  },

  getRevisionAffect(id) {
    return response(schedulingApi.get(`/revisions/${id}/affect/`));
  },

  patchFlightsAtPairingTemplate({ id, flights }) {
    return response(schedulingApi.patch(`/shells/${id}/`, { flights }));
  },

  patchFlightsAtPairing({ pairingId, flightIds }) {
    return response(axios.patch(`/fdt/api/scheduling/pairs/${pairingId}/`, {
      flight_ids: flightIds,
    }));
  },

  changePairingTemplate({ id, payload }) {
    return response(schedulingApi.patch(`/shells/${id}/`, payload));
  },

  addPairingTemplateGroup(name) {
    return response(schedulingApi.post('/shell-groups/', { name }));
  },

  listPlainGroups: ({ ...params }) => (
    response(schedulingApi.get('/shell-groups/plain/', { params }))
  ),

  applyPairingTemplate(id) {
    return response(schedulingApi.post(`/shells/${id}/apply/`));
  },

  updatePairingTemplateGroup(id, payload) {
    return response(schedulingApi.put(`/shell-groups/${id}/`, payload));
  },

  removePairingTemplate(id) {
    return response(schedulingApi.delete(`/shells/${id}/`));
  },

  addPairingTemplate({ groupId, startDate, endDate }) {
    return response(schedulingApi.post('/shells/', {
      start_date: startDate,
      end_date: endDate,
      group: groupId,
      flight_numbers: [],
      tomorrow_flights: [],
    }));
  },

  generateMonthlyPairing({ year, month }) {
    return response(schedulingApi.post('/revisions/pairing/', { year, month }));
  },

  generateDraftPairing({ id }) {
    return response(schedulingApi.post(`/revisions/${id}/pairing/`));
  },

  publishRevision({ id }) {
    return response(schedulingApi.post(`/revisions/${id}/publish/`));
  },

  addPair(pair) {
    return response(schedulingApi.post('/pairs/', {
      ...pair,
      flight_ids: [],
    }));
  },

  patchPair(pair) {
    return response(schedulingApi.patch(`/pairs/${pair.id}/`, pair));
  },

  splitPair(pair, split) {
    return response(schedulingApi.post(`/pairs/${pair}/split/`, { split }));
  },

  removePairing(pairingId) {
    return response(schedulingApi.delete(`/pairs/${pairingId}/`));
  },

  getShift(pairingId) {
    return response(schedulingApi.get(`/pairs/${pairingId}/`));
  },

  getRevisions({ year, month }) {
    return response(schedulingApi.get('/revisions/', { params: { year, month } }));
  },

  createRevision(params) {
    return response(schedulingApi.post('/revisions/', params));
  },

  removeRevision(id) {
    return response(schedulingApi.delete(`/revisions/${id}/`));
  },

  checkRevisionLegality(id) {
    return response(schedulingApi.get(`/revisions/${id}/legality/`));
  },

  setInitialMonthRevision(id) {
    return schedulingApi.post(`/revisions/${id}/set-initial/`);
  },

  unsetInitialMonthRevision(id) {
    return schedulingApi.delete(`/revisions/${id}/set-initial/`);
  },

  getPilotGrid(revision, filters) {
    return response(schedulingApi.get(`/calendar/${revision}/`, { params: filters }));
  },

  getPilotPayroll(revision, filters) {
    return response(schedulingApi.get(`/payroll/${revision}/`, { params: filters }));
  },

  getRecords(params) {
    return response(schedulingApi.get('/records/', { params }));
  },

  postRecord(params) {
    return response(schedulingApi.post('/records/', params));
  },

  patchRecord(id, params) {
    return response(schedulingApi.patch(`/records/${id}/`, params));
  },

  deleteRecord(recordId) {
    return response(schedulingApi.delete(`/records/${recordId}/`));
  },

  multiAddRecords(payload) {
    return response(schedulingApi.post('/pairs/multi-assign/', payload));
  },

  multiRemoveRecords(payload) {
    return response(schedulingApi.delete('/records/bulk-delete/', { data: payload }));
  },

  getCollisions() {
    return response(schedulingApi.get('/shells/collisions/'));
  },

  getGanttData(params) {
    return response(schedulingApi.get('/gantt/', { params }));
  },
  async getOpenTime(id) {
    return response(fdtApi.get(`/open-time/${id}/`));
  },
  async updateOpenTime(requestData) {
    if (requestData.id) {
      return response(fdtApi.put(`/open-time/${requestData.id}/`, requestData));
    }
    return response(fdtApi.post('/open-time/', requestData));
  },
  async cancelOpenTime(id) {
    return response(fdtApi.post(`/open-time/${id}/cancel/`));
  },
  async declineOpenTime(id) {
    return response(fdtApi.post(`/open-time/${id}/decline/`));
  },
  async acceptOpenTime(id) {
    return response(fdtApi.post(`/open-time/${id}/accept/`));
  },
  async approveOpenTime(id) {
    return response(fdtApi.post(`/open-time/${id}/approve/`));
  },
  fetchHolidays: year => response(schedulingApi.get('/holidays/', { params: { year } })),
  createHoliday: data => response(schedulingApi.post('/holidays/', data)),
  updateHoliday: ({ id, ...data }) => response(schedulingApi.put(`/holidays/${id}/`, data)),
  deleteHoliday: id => response(schedulingApi.delete(`/holidays/${id}`)),

  setPairSinglePilot: ({ id, isSingle }) => (
    response(schedulingApi.patch(
      `/pairs/${id}/`,
      { single_pilot: isSingle },
    ))
  ),

  getLinkedPairs: filters => response(schedulingApi.get('/pairs/linked/', { params: filters })),

  paidOffAssign: ({ revision, payload }) => response(schedulingApi.post(`/paid-offs/${revision}/`, payload)),
  sickAssign: ({ revision, payload }) => response(schedulingApi.post(`/sick-days/${revision}/`, payload)),
};
