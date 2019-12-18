import axios from 'axios';
import qs from 'query-string';
import { response } from '../../utils/api';

export default {
  getFilteredResults: params => response(
    axios.get('/wb/api/full_logs/', {
      params,
      paramsSerializer: params => qs.stringify(params)
    })
  ),
};
