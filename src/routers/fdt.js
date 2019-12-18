import { mapProps } from 'utils/routers';
import { role } from 'utils/permissions';

import CalendarView from 'components/FDT/Calendar/CalendarView.vue';
import SandboxView from 'components/FDT/Calendar/SandboxView.vue';

export default [
  { path: '', name: 'fdt_landing', redirect: { name: 'fdt_calendar' } },
  {
    path: 'calendar/:pilotId?/:month?/:year?/',
    component: CalendarView,
    name: 'fdt_calendar',
    props: mapProps({ pilotId: Number, month: Number, year: Number }),
    meta: {
      title: 'Crew Calendar',
      breadcrumb: 'Calendar',
    },
  },
  {
    path: 'sandbox/:pilotId?/:month?/:year?/',
    component: SandboxView,
    name: 'fdt_sandbox',
    props: mapProps({ pilotId: Number, month: Number, year: Number }),
    meta: {
      title: 'FDT Sandbox',
      breadcrumb: 'Sandbox',
      permissions: role('Admin'),
    },
  },
];
