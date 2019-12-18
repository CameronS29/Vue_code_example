import axios from 'axios';
import qs from 'query-string';
import {response} from '../../utils/api';

const api = axios.create({
  baseURL: '/flightlog/api/review-logs',
});

export const onlineTableApi = {
  getFilteredResults: params => {
    params = {...params, reviewed: 3};

    return response(
      api.get('', {
        params,
        paramsSerializer: params => qs.stringify(params),
      }),
    )
  },
};

export const historyTableApi = {
  getFilteredResults: params => {
    return response(
      api.get('', {
        params,
        paramsSerializer: params => qs.stringify(params),
      }),
    )
  },
};

export default {
  approve: id => response(api.post(`${id}/approve/`)),
};

