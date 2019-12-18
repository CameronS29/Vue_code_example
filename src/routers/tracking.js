import Dashboard from '../components/Tracking/Dashboard.vue';

export default [
  {
    path: 'dashboard/',
    component: Dashboard,
    name: 'tracking_dashboard',
    meta: {
      title: 'User Actions Analytics',
      breadcrumb: 'Dashboard',
    },
  },
  { path: '', name: 'tracking', redirect: { name: 'tracking_dashboard' } },
];
