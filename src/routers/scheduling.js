import SimpleView from '../components/SimpleView.vue';
import Scheduling from '../components/Scheduling/Calendar/Calendar.vue';
import Gantt from '../components/Scheduling/Gantt/Gantt.vue';
import PairingTemplateManagement from '../components/Scheduling/PairingTemplates/PairingTemplateManagement.vue';
import PairingManagement from '../components/Scheduling/PairingManagement/PairingManagement.vue';
import CrewCurrency from '../components/Scheduling/CrewCurrency/Main.vue';
import { mapProps } from '../utils/routers';
import { role } from '../utils/permissions';

export default [
  {
    path: '',
    name: 'scheduling_landing',
    redirect: { name: 'scheduling_calendar' },
  },
  {
    path: 'calendar/:year?/:month?/',
    component: Scheduling,
    props: mapProps({ year: Number, month: Number }),
    name: 'scheduling_calendar',
    meta: {
      title: 'Scheduling',
      breadcrumb: 'Scheduling Calendar',
    },
  },
  {
    path: 'gantt/:year?/:month?/',
    component: Gantt,
    props: mapProps({ year: Number, month: Number }),
    name: 'scheduling_gantt',
    meta: {
      title: 'Gantt',
      breadcrumb: 'Gantt Calendar',
    },
  },
  {
    path: 'pairing/',
    component: SimpleView,
    meta: {
      permissions: role('Scheduler'),
    },
    children: [
      {
        path: 'manage/',
        component: PairingManagement,
        name: 'scheduling_pairing_management',
        meta: {
          title: 'Shifts Management',
          breadcrumb: 'Shifts Management',
        },
      },
      {
        path: 'templates/',
        component: PairingTemplateManagement,
        name: 'scheduling_pairing_templates',
        meta: {
          title: 'Shift Template Management',
          breadcrumb: 'Shift Template Management',
        },
      },
    ],
  },
  {
    path: 'crew-currency/',
    component: CrewCurrency,
    name: 'crew-currency',
    meta: {
      title: 'Crew Currency',
      breadcrumb: 'Crew Currency',
    },
  },
];

