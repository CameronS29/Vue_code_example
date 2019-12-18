import axios from 'axios';
import qs from 'query-string';
import {response} from '../utils/api';

export default {
  getFilteredResults: params => response(
    axios.get('/flightlog/api/aircraft/state/', {
      params,
      paramsSerializer: params => qs.stringify(params)
    })
  ),
  getSwaps: () => response(axios.get('/dispatch/api/engine/swap/')),
  requestCSV: (data, order) =>
    axios.get(`/flightlog/api/aircraft/state/csv/?${qs.stringify(data)}&ordering=${order}`)
      .then(({data: {uid}}) => uid),
}
