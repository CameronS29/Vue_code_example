import Dashboard from '../components/MXC/Dashboard.vue';
import StateHistory from '../components/MXC/State/History.vue';

export default [
  {
    path: 'dashboard/',
    component: Dashboard,
    meta: { title: 'Maintenance QA Dashboard' },
    name: 'maintenance_qa_dashboard',
    props: { isReadOnly: true },
  },
  {
    path: 'state/',
    component: StateHistory,
    name: 'maintenance_qa_state',
    meta: {
      title: 'State History',
      breadcrumb: 'State History',
    },
    props: { isReadOnly: true },
  },
];

