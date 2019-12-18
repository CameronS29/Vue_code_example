import axios from 'axios';
import qs from 'query-string';
import { response } from '../../utils/api';

export default path => ({
  getFilteredResults: params => response(axios.get(path, {
    params,
    paramsSerializer: qs.stringify,
  })),
});
