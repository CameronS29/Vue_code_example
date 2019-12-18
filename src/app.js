window.Promise = require('bluebird');
import axios from "axios";
import Cookies from "js-cookie";
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';
import PortalVue from 'portal-vue';
import TreeView from "vue-json-tree-view";


import './element';

import BackgroundJob from "./components/BackgroundJob.vue";
import ActiveJobs from "./components/Jobs/ActiveJobs.vue";
import AircraftType from "./components/WB/AircraftType.vue";
import FireCheck from "./components/FlightLog/form/FireCheck.vue";
import VorCheck from "./components/FlightLog/form/VorCheck.vue";
import VorCheckInject from "./components/FlightLog/inject/VorCheck.vue";
import FireCheckInject from "./components/FlightLog/inject/FireCheck.vue";
import SocketStatus from './components/SocketConnectionStatus.vue';
import WBPropsBtn from './components/WB/Inject/AcTypeBtn.vue';
import WBAircraftBtn from './components/WB/Inject/AircraftBtn.vue';

import ScrollSync from './utils/scroll-sync/directive';
import FormsPlugin from './plugins/forms/Forms';
import createStore from './store';
import { trackVue } from './tracking';
import createSock, { connectStore, connectWith } from './sockets';
import { attachComponents, createApp } from './utils/inject';


import AppView from './components/App.vue';
import appRoutes from './routers';

axios.defaults.headers.common['X-CSRFToken'] = Cookies.get("csrftoken");

Vue.use(VueRouter);
Vue.use(Vuelidate);
Vue.use(PortalVue);
Vue.use(FormsPlugin);
Vue.use(TreeView);
Vue.use(trackVue);
Vue.use(ScrollSync);

const host = window.location.host;
const proto = window.location.protocol.replace(/http/, 'ws');

export const sock = createSock(`${proto}//${host}/aio/websocket`);
export const store = createStore(connectStore(sock));
Vue.use(connectWith(sock));


attachComponents(store, {
  BackgroundJob,
  AircraftType,
  ActiveJobs,
  SocketStatus,
  Vorcheck: VorCheck,
  Firecheck: FireCheck,
  VorcheckInject: VorCheckInject,
  FirecheckInject: FireCheckInject,
  WbPropsButton: WBPropsBtn,
  WbAircraftPropsButton: WBAircraftBtn,
});

window.$app = createApp({
  store,
  component: AppView,
  el: '#fltops-app',
  routes: appRoutes,
  base: '/app/',
});
