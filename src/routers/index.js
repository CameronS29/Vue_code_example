import mxc from './mxc';
import maintenanceQA from './maintenance-qa';
import dispatch from './dispatch';
import wb from './wb';
import reports from './reports';
import fdt from './fdt';
import fsdo from './fsdo';
import scheduling from './scheduling';
import manifest from './manifest';
import sandbox from './sandbox';
import routeplanning from './routeplanning';
import feedback from './feedback';
import securityDashboard from './security_dashboard';
import securityForm from './security_form';
import tracking from './tracking';
import opManagement from './op-management';

import SimpleView from '../components/SimpleView.vue';
import NotFound from '../components/App/NotFound.vue';
import Forbidden from '../components/App/Forbidden.vue';

import MXC from '../components/MXC/MXC.vue';
import WeightBalance from '../components/WB/WeightBalance.vue';

import OpenTimeUpdateView from '../components/Scheduling/OpenTime/Form/UpdateView.vue';
import OpenTimeReadView from '../components/Scheduling/OpenTime/Form/ReadView.vue';
import OpenTimeListView from '../components/Scheduling/OpenTime/Form/ListView';

import Scheduling from '../components/Scheduling/Calendar/Calendar.vue';

import { flag, role } from '../utils/permissions';
import { mapProps } from 'utils/routers';

export default [
  {
    path: '/mxc/',
    children: mxc,
    component: MXC,
    meta: {
      breadcrumb: 'MXC Dashboard',
      permissions: flag('show_mxc'),
    },
  },
  {
    path: '/maintenance-qa/',
    children: maintenanceQA,
    component: MXC,
    meta: {
      breadcrumb: 'Maintenance QA Dashboard',
      permissions: flag('show_maintenance_qa'),
    },
  },
  {
    path: '/dispatch/',
    children: dispatch,
    component: SimpleView,
    meta: {
      breadcrumb: 'Dispatch Dashboard',
      permissions: [
        flag('show_dispatch'),
        role('Dispatcher'),
      ],
    },
  },
  {
    path: '/fdt/',
    children: fdt,
    component: SimpleView,
    meta: {
      breadcrumb: 'Flight & Duty Time',
      permissions: [
        flag('show_fd'),
        role('Scheduler', 'Dispatcher', 'Pilot'),
      ],
    },
  },
  {
    path: '/scheduling/',
    children: scheduling,
    component: SimpleView,
    meta: {
      breadcrumb: 'Scheduling',
      permissions: [
        flag('show_scheduler'),
        role('Scheduler', 'Dispatcher'),
      ],
    },
  },
  {
    path: '/open-time/',
    component: SimpleView,
    meta: {
      permissions: [
        role('Scheduler', 'Pilot'),
        flag('show_opentime'),
      ],
    },
    children: [
      {
        path: 'new/',
        component: OpenTimeUpdateView,
        name: 'open_time_create',
        meta: {
          title: 'Open Time Request',
          breadcrumb: 'Open Time Request',
        },
      },
      {
        path: 'list/',
        component: OpenTimeListView,
        name: 'open_time_list',
        meta: {
          title: 'Open Time Requests',
          breadcrumb: 'Open Time Requests',
        },
      },
      {
        path: ':id/',
        props: mapProps({ id: Number }),
        component: OpenTimeReadView,
        name: 'open_time_get',
        meta: {
          title: 'Open Time Request',
          breadcrumb: 'Open Time Request',
        },
      },
    ],
  },
  {
    path: '/wb/',
    children: wb,
    component: WeightBalance,
    meta: {
      breadcrumb: 'Weight & Balance',
      permissions: flag('show_wb'),
    },
  },
  {
    path: '/fsdo/',
    children: fsdo,
    component: SimpleView,
    meta: {
      breadcrumb: 'FSDO',
      permissions: flag('show_fsdo'),
    },
  },
  {
    path: '/reports/',
    children: reports,
    component: SimpleView,
    meta: {
      breadcrumb: 'Reports',
      permissions: flag('show_reports'),
    },
  },
  {
    path: '/feedback/',
    children: feedback,
    component: SimpleView,
    meta: {
      permissions: role('SuperUser'),
    },
  },

  {
    path: '/forbidden/',
    name: 'forbidden',
    component: Forbidden,
    meta: {
      title: 'Access Forbidden',
    },
  },
  {
    path: '*',
    component: NotFound,
    meta: {
      title: 'Page Not Found',
    },
  },
  {
    path: '/sandbox/',
    children: sandbox,
    component: SimpleView,
    meta: {
      breadcrumb: 'Sandbox',
      permissions: role('SuperUser'),
    },
  },
  {
    path: '/routeplanning/',
    children: routeplanning,
    component: SimpleView,
    meta: {
      breadcrumb: 'Route Planning',
    },
  },
  {
    path: '/manifests/',
    children: manifest,
    component: SimpleView,
    meta: {
      breadcrumb: 'Pilot Dashboard',
      permissions: [
        role('Pilot'),
      ],
    },
  },
  {
    path: '/pilot-sched/:year?/:month?/',
    component: Scheduling,
    props: mapProps({ year: Number, month: Number }),
    name: 'pilot_sched',
    meta: {
      title: 'Scheduling',
      breadcrumb: 'Scheduling Calendar',
      isPilotView: true,
      permissions: [
        flag('show_scheduler'),
        role('Pilot'),
      ],
    },
  },
  {
    path: '/security/',
    children: securityDashboard,
    component: SimpleView,
    meta: {
      breadcrumb: 'Security Dashbaord',
      permissions: [
        flag('show_security_dashboard'),
      ],
    },
  },
  {
    path: '/security_form/',
    children: securityForm,
    component: SimpleView,
    meta: {
      breadcrumb: 'Security Form',
      permissions: [
        flag('show_security_form'),
      ],
    },
  },
  {
    path: '/tracking/',
    component: SimpleView,
    children: tracking,
    meta: {
      breadcrumb: 'User Analytics',
      permissions: role('Admin'),
    },
  },
  {
    path: '/op-management/',
    component: SimpleView,
    children: opManagement,
    meta: {
      breadcrumb: 'Operations Management',
      permissions: [
        flag('op-management'),
      ],
    },
  },
];
