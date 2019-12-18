import FlightList from '../components/Dispatch/FlightList/FlightList.vue';

export default [
  {
    path: 'flight-list/',
    component: FlightList,
    name: 'op_flight_list',
    meta: {
      title: 'Flight List',
      breadcrumb: 'Flight List',
    },
    props: { isFlightsEditable: true },
  },
];

