import Dashboard from "../components/Security/Dashboard/View.vue";
import Form from "../components/Security/Form/View.vue";
import ReadView from "../components/Security/Read/View.vue";
import { flag} from '../utils/permissions';

export default [
  {
    path: '',
    component: Form,
    meta: {
      title: 'Security Search Form' ,
      permissions: flag('show_security_form'),
    },
    name: 'security_form'
  },
  {
    path: ':id/view',
    props: true,
    component: ReadView,
    meta: {
      title: 'Security Search Details',
      permissions: flag('show_security_dashboard', 'show_security_form'),
    },
    name: 'security_confirm'
  }
];
