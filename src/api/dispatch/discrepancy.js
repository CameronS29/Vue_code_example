import { omit } from 'lodash';
import axios from 'axios';
import qs from 'query-string';

import { response } from '../../utils/api';

const discrepancyAPI = axios.create({
  baseURL: '/dispatch/api/discrepancy',
  paramsSerializer: params => qs.stringify(params),
});

export default {
  getDiscrepancies: () => response(discrepancyAPI.get('/')),
  post: item => response(discrepancyAPI.post('/', item)),
  patch: item => response(discrepancyAPI.patch(`/${item.id}/`, omit(item, (value, key) => key !== item.id))),
  delete: id => response(discrepancyAPI.delete(`/${id}/`)),
  getFilteredResults: params => response(discrepancyAPI.get('/', {
    params,
    paramsSerializer: params => qs.stringify(params),
  })),
};
