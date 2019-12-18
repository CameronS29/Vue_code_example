import axios from 'axios';

export const tableApi = createTableApi('/fdt/api/scheduling/flights/');
import createTableApi from './factory/table';
import { response } from '../utils/api';

const flightsApi = axios.create({
  baseURL: '/flight/api',
});

export default {
  changeAircraftType: data => response(flightsApi.post('/change-aircraft-type/batch/', data)),
  removeFlight: flightId => response(flightsApi.post('/change-activation/', {
    is_active: false,
    flight: flightId,
  })),
};
