import Dashboard from "../components/Security/Dashboard/View.vue";
import Form from "../components/Security/Form/View.vue";
import ReadView from "../components/Security/Read/View.vue";
import { flag} from '../utils/permissions';

export default [
  {
    path: '',
    component: Dashboard,
    name: 'security_dashboard',
    meta: {
      title: 'Security Search Dashboard',
      permissions: flag('show_security_dashboard'),
    }
  },
  {
    path: ':id/view',
    props: true,
    component: ReadView,
    meta: {
      title: 'Security Search Details',
      permissions: flag('show_security_dashboard'),
    },
    name: 'security_view'
  }
];
