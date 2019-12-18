import axios from 'axios';
import { response } from '../../utils/api';

const wbApi = axios.create({
  baseURL: '/wb/api',
});

export default {
    getComments: wbId => response(wbApi.get(`/${wbId}/comments/`)),
    pushComment: (wbId, data) => response(
      wbApi.post(`/wb/api/${wbId}/comments/`, data)),
};
