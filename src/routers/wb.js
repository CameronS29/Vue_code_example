import List from '../components/WB/LogList/List.vue';
import LogDetail from '../components/WB/LogView/Detail.vue';
import FullList from '../components/WB/FullList.vue';
import { role } from '../utils/permissions';

export default [
  {
    path: 'dashboard/',
    component: List,
    name: 'wb_list',
    meta: { title: 'Weight & Balance Dashboard', breadcrumb: 'Dashboard' },
  },
  {
    path: 'log/:id',
    component: LogDetail,
    name: 'wb_log',
    props: true,
    meta: {
      breadcrumb: 'Edit Log',
      title: 'Weight & Balance Log',
    },
  },
  {
    path: 'analytics/',
    component: FullList,
    name: 'wb_full_list',
    meta: {
      title: 'Weight & Balance Analytics',
      breadcrumb: 'Analytics',
      permissions: role('Admin'),
    },
  },

  // Redirects
  { path: '', name: 'wb_landing', redirect: { name: 'wb_list' } },
];

