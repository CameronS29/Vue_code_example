import axios from 'axios';
import { response } from '../../utils/api';

const wbApi = axios.create({
  baseURL: '/wb/api',
});

export default {
  sendConfirmation: data => response(wbApi.post('/confirmation/', data)),
  listConfirmations: wb => response(wbApi.get(`/${wb}/confirmations/`)),
};
