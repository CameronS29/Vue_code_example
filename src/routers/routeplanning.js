import Main from '../components/RoutePlanningGantt/Main.vue';
import Lines from '../components/RoutePlanningGantt/Lines/Main.vue';
import RoutesView from '../components/RoutePlanningGantt/Routes/RoutesView.vue';
import { flag } from '../utils/permissions';

export default [
  {
    path: '',
    component: Main,
    name: 'routeplanning_gantt',
    props: true,
    meta: {
      title: 'Gantt',
      permissions: [
        flag('flag_routeplanning'),
      ],
    },
  },
  {
    path: 'lines/',
    component: Lines,
    name: 'lines_management',
    props: true,
    meta: {
      title: 'Lines',
      breadcrumb: 'Lines Management',
    },
  },
  {
    path: 'routes/',
    component: RoutesView,
    name: 'rp_routes',
    props: true,
    meta: {
      title: 'Lines',
      breadcrumb: 'Route Management',
    },
  },
];
