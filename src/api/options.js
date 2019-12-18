import axios from 'axios';
import {response} from '../utils/api';


const optionsApi = axios.create({
  baseURL: '/api',
});

export default {
  getFlightOptions: () => response(optionsApi.get('/flights/options/')),
  getPilotOptions: () => response(optionsApi.get('/pilot/short/')),
  getUserOptions: () => response(optionsApi.get('/user/short/')),
  getFlightManifestOptions: () => response(optionsApi.get('/manifest/options/')),
};
