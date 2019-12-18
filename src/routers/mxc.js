import get from 'lodash/get';

import Dashboard from "../components/MXC/Dashboard.vue";
import EngineSwap from "../components/MXC/Engine/Swap/Update.vue";
import UpdateView from "../components/MXC/Correction/UpdateView.vue";
import CorrectionListView from "../components/MXC/Correction/ListView.vue";
import EngineSwapList from "../components/MXC/Engine/Swap/ListView.vue";
import EngineList from "../components/MXC/Engine/List/ListView.vue";
import EngineCreate from "../components/MXC/Engine/List/Modal/Create.vue";
import EngineUpdate from "../components/MXC/Engine/List/Modal/Update.vue";
import StateHistory from "../components/MXC/State/History.vue";
import Aircraft from "../components/MXC/Aircraft/AircraftMain.vue";
import AircraftUpdateView from "../components/MXC/Aircraft/Update/UpdateView.vue";
import MEL from "../components/MXC/MEL/List.vue";
import Discrepancy from "../components/MXC/Discrepancy/View.vue";

const correctionUpdateBreadcrumb = (vm) => {
  const aircraft = get(vm.selectedAircraft, 'registration');
  if (aircraft) {
    return `Correction of ${aircraft}`;
  }
  return 'Adjustment';
};

const engineSwapBreadcrumb = (vm) => {
  const aircraft = get(vm.selectedAircraft, 'registration');
  if (aircraft) {
    return `Edit Engine Installed on ${aircraft}`;
  }
  return 'Edit Engine';
};

export default [
  {path: '', name: 'mxc_landing', redirect: { name: 'mxc_dashboard' } },
  {path: "dashboard/", component: Dashboard, meta: {title: "MXC Dashboard"}, name: "mxc_dashboard",},
  {
    path: "aircraft/:aircraft/swap/list/",
    component: EngineSwapList,
    name: "engine_swap_list",
    props: (route) => ({
      aircraft: parseInt(route.params.aircraft),
    }),
    meta: {
      title: "Full engine history",
      breadcrumb: vm => `${get(vm.selectedAircraft, 'registration') || ''} Full Engine History`,
    }
  },
  {
    path: "state/",
    component: StateHistory,
    name: "mxc_state",
    meta: {title: "State History", breadcrumb: "State History"}
  },
  {
    path: "aircraft/",
    component: Aircraft,
    name: "aircraft_dashboard",
    meta: {title: "Aircraft management", breadcrumb: "Aircraft management"},
    children: [
      {
        path: "new/",
        component: AircraftUpdateView,
        name: "aircraft_new",
        meta: {title: "New aircraft", breadcrumb: "New aircraft"}
      },
      {
        path: ":id/",
        component: AircraftUpdateView,
        name: "aircraft_edit",
        meta: {title: "Aircraft edit", breadcrumb: "Aircraft edit"},
        props: (route) => ({
          id: parseInt(route.params.id),
        })
      },
    ]
  },
  {
    path: "engine/",
    component: EngineList,
    name: "engine_list",
    meta: {title: "Engines list", breadcrumb: "Engines list"},
    children: [
      {
        path: "new/",
        component: EngineCreate,
        name: "engine_create",
        meta: {showModal: true}

      },
      {
        path: ":id/",
        component: EngineUpdate,
        name: "engine_edit",
        meta: {showModal: true},
        props: (route) => ({
          id: parseInt(route.params.id),
        })
      }
    ]
  },
  {
    path: "aircraft/swap/edit/:id/",
    component: EngineSwap,
    name: "engine_swap_edit",
    meta: {
      title: "Edit Engine Installed",
      breadcrumb: engineSwapBreadcrumb,
    },
    props: (route) => ({
      id: parseInt(route.params.id),
    })
  },
  {
    path: "aircraft/:aircraftId/swap/:enginePosition/",
    meta: {
      title: "Edit Engine Installed",
      breadcrumb: engineSwapBreadcrumb,
    },
    component: EngineSwap,
    name: "engine_swap",
    props: (route) => ({
      aircraftId: parseInt(route.params.aircraftId),
      enginePosition: parseInt(route.params.enginePosition)
    })
  },
  {
    path: "aircraft/:aircraftId/adjust/",
    component: UpdateView,
    name: "aircraft_adjust",
    meta: {
      title: "Adjustment",
      breadcrumb: correctionUpdateBreadcrumb,
    },
    props: (route) => ({
      aircraftId: parseInt(route.params.aircraftId),
    })
  },
  {
    path: "aircraft/adjust/:id/",
    component: UpdateView,
    name: "aircraft_adjust_edit",
    meta: {
      title: "Adjustment",
      breadcrumb: correctionUpdateBreadcrumb,
    },
    props: (route) => ({
      id: parseInt(route.params.id),
    })
  },
  {
    path: "aircraft/:aircraft/adjust/list/",
    component: CorrectionListView,
    name: "aircraft_adjust_list",
    meta: {
      title: "Adjustment history",
      breadcrumb: vm => `${get(vm.selectedAircraft, 'registration', '')} Adjustment History`,
    },
    props: (route) => ({
      aircraft: parseInt(route.params.aircraft),
    })
  },
  {
    path: "mel/",
    component: MEL,
    name: "mel_management",
    meta: {
      title: "MEL Management",
      breadcrumb: "MEL Management"
    },
  },
  {
    path: "discrepancy/",
    component: Discrepancy,
    name: "discrepancy_management",
    meta: {
      title: "Discrepancy Management",
      breadcrumb: "Discrepancy Management"
    },
  },
];

