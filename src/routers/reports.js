import OnTime from '../components/Reports/OnTime/View.vue';
import RouteModal from '../components/Reports/OnTime/RouteModal.vue';
import Delay from '../components/Reports/Delay/Dashboard.vue';
import T100 from '../components/Reports/T100/View.vue';

export default [
  { path: '', name: 'report_landing', redirect: { name: 'report_ontime' } },
  {
    path: 'ontime/',
    component: OnTime,
    name: 'report_ontime',
    meta: {
      title: 'On-Time Performance Report',
      breadcrumb: 'On-Time Performance',
    },
    children: [
      {
        path: 'route/:origin/:destination/',
        component: RouteModal,
        name: 'report_ontime_drilldown',
        meta: {
          title: 'On-Time Performance Report',
        },
        props: true,
      },
    ],
  },
  {
    path: 'delay/',
    component: Delay,
    name: 'report_delay',
    meta: {
      title: 'Delay Report',
      breadcrumb: 'Delay',
    },
  },
  {
    path: 't100/',
    component: T100,
    name: 'report_delay',
    meta: {
      title: 'Delay Report',
      breadcrumb: 'Delay',
    },
  },
];
