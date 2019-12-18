import axios from 'axios';

export default {
  getStatusLogs: flightlog =>
    axios.get(`/flightlog/api/${flightlog}/status-logs/`).then(({data}) => data),
}
