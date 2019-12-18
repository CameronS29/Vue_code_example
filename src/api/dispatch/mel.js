import { omit } from 'lodash';
import axios from 'axios';
import qs from 'query-string';

import { response } from '../../utils/api';

const melAPI = axios.create({
  baseURL: '/dispatch/api/mel',
  paramsSerializer: params => qs.stringify(params),
});

export default {
  getMEL: () => response(melAPI.get('/')),
  post: item => response(melAPI.post('/', item)),
  patch: item => response(melAPI.patch(`/${item.id}/`, omit(item, 'id'))),
  delete: id => response(melAPI.delete(`/${id}/`)),
};
