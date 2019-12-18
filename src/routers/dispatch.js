import Dashboard from '../components/Dispatch/Dashboard/View.vue';
import AircraftInspections from '../components/Dispatch/Inspections/Aircraft.vue';
import ElogList from '../components/Dispatch/Elog/List.vue';
import FlightList from '../components/Dispatch/FlightList/FlightList.vue';
import EChecklist from '../components/Dispatch/EChecklist/Main.vue';
import FlightDaily from '../components/Dispatch/FlightList/FlightDaily.vue';
import VidecomForm from '../components/Dispatch/Videcom/View.vue';
import SyncForm from '../components/Dispatch/Sync/View.vue';
import HistoricalSync from '../components/Dispatch/Sync/HistoricalSync.vue';

import ManifestUpdate from "../components/FlightLog/ManifestView/Update/View.vue";
import ManifestRead from "../components/FlightLog/ManifestView/ReadView.vue";
import ManifestDetail from "../components/FlightLog/ManifestView/DetailView.vue";
import FlightLogDetail from '../components/FlightLog/Log/DetailView.vue';
import FlightLogUpdate from '../components/FlightLog/Log/Update/View.vue';
import { flag, role } from 'utils/permissions';
import { mapProps } from 'utils/routers';

export default [
  { path: '', name: 'dispatch_landing', redirect: { name: 'dispatch_dashboard' } },
  { path: 'inspections/aircrafts/', redirect: { name: 'dispatch_inspections'} },
  {
    path: 'dashboard/',
    component: Dashboard,
    name: 'dispatch_dashboard',
    meta: {
      title: 'Dispatch Dashboard',
    },
  },
  {
    path: 'videcom-form/',
    component: VidecomForm,
    name: 'videcom_form',
    meta: {
      title: 'Videcom Form',
    },
  },
  {
    path: 'inspections/',
    component: AircraftInspections,
    name: 'dispatch_inspections',
    meta: {
      title: 'Aircraft Inspections',
      breadcrumb: 'Aircraft Inspections',
    },
  },
  {
    path: 'flight-list/',
    component: FlightList,
    name: 'dispatch_flight-list',
    meta: {
      title: 'Flight List',
      breadcrumb: 'Flight List',
    },
  },
  {
    path: 'e-checklist/',
    component: EChecklist,
    name: 'dispatch_e-checklist',
    meta: {
      title: 'e-Checklist',
      breadcrumb: 'e-Checklist',
    },
  },
  {
    path: 'flight-daily/',
    component: FlightDaily,
    name: 'dispatch_flight-daily',
    meta: {
      title: 'Flight Daily View',
      breadcrumb: 'Flight Daily View',
      permissions: [
        flag('show_status'),
      ],
    },
  },
  {
    path: 'sync/',
    component: SyncForm,
    name: 'flight_sync',
    meta: {
      title: 'Synchronization',
      breadcrumb: 'Synchronization',
    },
    children: [
      {
        path: 'historical/:id/',
        component: HistoricalSync,
        name: 'historical_sync',
        props: true,
      },
    ]
  },
  {
    path: 'elog/',
    component: ElogList,
    name: 'dispatch_elog',
    meta: {
      title: 'ELog List',
      breadcrumb: 'ELog List',
    },
  },
  {
    path: ':id/',
    component: ManifestDetail,
    props: true,
    children: [
      {
        path: 'edit',
        component: ManifestUpdate,
        name: 'dispatch_manifest_edit',
        props: true,
        meta: {
          title: 'Dispatch Manifest Edit'
        }
      },
      {
        path: 'view',
        component: ManifestRead,
        name: 'dispatch_manifest_view',
        props: true,
        meta: {
          title: 'Dispatch Manifest View'
        }
      },
      {
        path: 'logs/:logId/',
        component: FlightLogDetail,
        props: true,
        children: [
          {
            path: '',
            component: FlightLogUpdate,
            name: 'dispatch_log_edit',
            props: true,
            meta: {
              breadcrumb: 'Manifest Edit',
              breadcrumb_name: 'dispatch_manifest_edit',
              title: 'Dispatch Flightlog',
            },
          },
        ]
      }
    ]
  },
];
