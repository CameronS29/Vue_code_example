import get from 'lodash/get';
import Dashboard from '../components/FlightLog/Dashboard/View.vue';
import ManifestUpdate from '../components/FlightLog/ManifestView/Update/View.vue';
import ManifestRead from '../components/FlightLog/ManifestView/ReadView.vue';
import ManifestDetail from '../components/FlightLog/ManifestView/DetailView.vue';
import FlightLogDetail from '../components/FlightLog/Log/DetailView.vue';
import FlightLogUpdate from '../components/FlightLog/Log/Update/View.vue';

export default [
  {
    path: '',
    component: Dashboard,
    meta: { title: 'Pilot Dashboard' },
    name: 'pilot_dashboard',
  },
  {
    path: ':id/',
    component: ManifestDetail,
    props: true,
    children: [
      {
        path: 'edit',
        component: ManifestUpdate,
        name: 'pilot_manifest_edit',
        props: true,
        meta: {
          title: 'Pilot Manifest Edit',
        },
      },
      {
        path: 'view',
        component: ManifestRead,
        name: 'pilot_manifest_view',
        props: true,
        meta: {
          title: 'Pilot Manifest View',
        },
      },
      {
        path: 'logs/:logId/',
        component: FlightLogDetail,
        props: true,
        children: [
          {
            path: '',
            component: FlightLogUpdate,
            name: 'pilot_log_edit',
            props: true,
            meta: {
              breadcrumb: 'Manifest Edit',
              breadcrumb_name: 'pilot_manifest_edit',
              title: 'Pilot Flightlog',
            },
          },
        ],
      },
    ],

  },
];
