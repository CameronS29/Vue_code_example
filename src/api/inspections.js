import axios from 'axios';

export default {
  listAircrafts(cb) {
    return axios.get(`/flightlog/api/aircraft/due/`)
      .then(({data}) => data);
  },
  listAircrafts(cb) {
    return axios.get(`/flightlog/api/aircraft/due/`)
      .then(({data}) => data);
  },
}
