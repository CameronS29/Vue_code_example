import get from 'lodash/get';
import Dashboard from "../components/FSDO/Dashboard.vue";
import WBLogView from "../components/FSDO/WB/View.vue";

import ManifestRead from "../components/FlightLog/ManifestView/ReadView.vue";
import ManifestDetail from "../components/FlightLog/ManifestView/DetailView.vue";
import FlightLogDetail from '../components/FlightLog/Log/DetailView.vue';
import FlightLogRead from '../components/FlightLog/Log/Read/View.vue';

export default [
  {
    path: '',
    component: Dashboard,
    meta: { title: 'FSDO Dashboard' },
    name: 'fsdo_dashboard'
  },
  {
    path: 'wb_log/:id/',
    component: WBLogView,
    name: 'fsdo_wb_log',
    props: true,
    meta: {
      breadcrumb: 'Weight & Balance Logs',
      title: 'Weight & Balance Logs',
    },
  },

  {
    path: 'manifest/:id/',
    component: ManifestDetail,
    props: true,
    children: [
      {
        path: 'view',
        component: ManifestRead,
        name: 'fsdo_manifest',
        props: true,
        meta: {
          title: 'FSDO Manifest View'
        }
      },
      {
        path: 'logs/:logId/',
        component: FlightLogDetail,
        props: true,
        children: [
          {
            path: 'view',
            component: FlightLogRead,
            name: 'fsdo_log_view',
            props: true,
            meta: {
              breadcrumb: "Manifest View",
              breadcrumb_name: 'fsdo_manifest',
              title: 'FSDO Flightlog View'
            }
          }
        ]
      }
    ]
  },
];
