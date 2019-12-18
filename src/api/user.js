import axios from 'axios';
import { response } from '../utils/api';

export default {
  getUserInfo: () => response(axios.get('/account/api/me/')),
  getWaffleFlags: () => response(axios.get('/account/api/waffle/flags/')),
};
