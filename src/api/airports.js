import axios from 'axios';
import { response } from 'utils/api';

export default {
  airportsList: async () => response(axios.get('/api/flights/options/'))
    .then(({ airports }) => (airports)),
  basesList: filters => response(axios.get('/api/airports/bases/', { params: filters })),
};
