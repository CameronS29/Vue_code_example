import axios from 'axios';
import { response } from 'utils/api';

const api = axios.create({
  baseURL: '/route-planning/api',
});

export default {
  getFlights: filters => response(api.get('/route-flights/', { params: filters })),
  assignFlight: ({ flight, aircraft, live = true }) => response(api.post('/assignment/', {
    flight,
    aircraft,
    live,
  })),
  assignFlights: ({ flights, aircraft, live = true }) => response(api.post('/assignment/batch/', {
    flights,
    aircraft,
    live,
  })),
  publish: () => response(api.post('/publish/')),

  getLines: () => response(api.get('/line/')),
  getRoutes: () => response(api.get('/route/')),
  patchRoute: route => response(api.patch(`/route/${route.id}/`, route)),
  calcRoute: (routeId, data) => response(api.post(`/route/${routeId}/calc/`, data)),
  calcRoutes: data => response(api.post('/route/calc/', data)),
  addLine: payload => response(api.post('/line/', payload)),
  deleteLine: id => response(api.delete(`/line/${id}/`)),
  patchLine: line => response(api.patch(`/line/${line.id}/`, line)),
};

