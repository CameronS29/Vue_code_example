import axios from 'axios';

export default {
  listAircrafts(cb) {
    axios.get(`/flightlog/api/aircraft/`)
      .then(response => {
        cb(response.data);
      });
  },
  listAircraftTypes() {
    return axios.get(`/dispatch/api/aircraft-type/`).then(({data}) => data);
  },
  listEngines() {
    return axios.get(`/flightlog/api/aircraft/engine/?active=1`).then(({data}) => data)
  },
  listAllEngines() {
    return axios.get(`/flightlog/api/aircraft/engine/`).then(({data}) => data)
  },
  getAircraft(id) {
    return axios.get(`/dispatch/api/aircraft/${id}/`)
      .then(({data}) => data)
  },
  pushAircraft(data) {
    const action = data.id
      ? data => axios.put(`/dispatch/api/aircraft/${data.id}/`, data)
      : data => axios.post(`/dispatch/api/aircraft/`, data);
    return action(data).then(({data}) => data);
  },
  patchAircraft(aircraft) {
    return axios.patch(`/dispatch/api/aircraft/${aircraft.id}/`, aircraft).then(({ data }) => data);
  },
  pushEngine(data) {
    const action = data.id
      ? data => axios.put(`/flightlog/api/aircraft/engine/${data.id}/`, data)
      : data => axios.post(`/flightlog/api/aircraft/engine/`, data);
    return action(data).then(({data}) => data);
  },
  deactivateEngine(id, cb) {
    return axios.patch(`/flightlog/api/aircraft/engine/${id}/`, {'active': false}).then(({data}) => data);
  },
  activateEngine(id, cb) {
    return axios.patch(`/flightlog/api/aircraft/engine/${id}/`, {'active': true}).then(({data}) => data);
  },
  removeEngine(id, cb) {
    return axios.delete(`/flightlog/api/aircraft/engine/${id}/`);
  },
  getEngine(id) {
    return axios.get(`/flightlog/api/aircraft/engine/${id}/`)
      .then(({data}) => data)
  },
  fetchAircraft(id) {
    return axios.get(`/flightlog/api/aircraft/${id}/`);
  },
  listCorrections(aircraft) {
    return axios.get(`/flightlog/api/aircraft/correction/?aircraft=${aircraft}`)
      .then(({data}) => data)
  },
  getCorrection(id) {
    return axios.get(`/flightlog/api/aircraft/correction/${id}/`)
      .then(({data}) => data)
  },
  deleteCorrection(id) {
    return axios.delete(`/flightlog/api/aircraft/correction/${id}/`)
      .then(({data}) => data)
  },
  pushCorrection(data, pilot) {
    const action = data.id
      ? data => axios.put(`/flightlog/api/aircraft/correction/${data.id}/`, data)
      : data => axios.post(`/flightlog/api/aircraft/correction/`, data);
    return action(data).then(({data}) => data);
  },
}
