import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

const useVuexLogger = localStorage.useVuexLogger;

import app from './modules/app';
import airports from "./modules/airports";
import scheduling from "./modules/scheduling";
import wb from "./modules/wb";
import aircraft from "./modules/aircraft";
import flightlog from "./modules/flightlog";
import engine from "./modules/aircraft/engine";
import errors from "./modules/errors";
import inspections from "./modules/inspections";
import jobs from "./modules/jobs";
import user, { RECEIVE_USER, RECEIVE_FLAGS } from "./modules/user";
import pilots from "./modules/pilots";
import manifest from "./modules/flightlog/manifest";
import sandbox from "./modules/sandbox";
import fdt from "./modules/fdt";
import dispatch from './modules/dispatch';
import reports from './modules/reports';
import routeplanningGantt from './modules/routeplanningGantt';
import pilotManifest from './modules/pilotManifest';
import offline from '../utils/offline/storeModule';
import feedback from './modules/feedback';
import flights from './modules/flights';
import security from './modules/security';

Vue.use(Vuex);

let store;

export default (...plugins) => {
  store = new Vuex.Store({
    modules: {
      app,
      wb,
      jobs,
      aircraft,
      airports,
      scheduling,
      sandbox,
      inspections,
      flightlog,
      pilotManifest,
      engine,
      pilots,
      fdt,
      manifest,
      errors,
      user,
      dispatch,
      reports,
      routeplanningGantt,
      offline,
      feedback,
      flights,
      security,
      tables: { namespaced: true },
    },
    plugins: plugins.concat(useVuexLogger ? [createLogger()] : []),
  });

  store.commit(`user/${RECEIVE_USER}`, window.userData);
  store.commit(`user/${RECEIVE_FLAGS}`, window.waffleData);
  return store;
}


if (module.hot) {
  /**
   * module.hot.accept does not accept a dynamic argument. Inline the list of files into the call
   * https://github.com/webpack/webpack/issues/5128#issuecomment-310210883
   */
  module.hot.accept(
    [
      './modules/app',
      './modules/airports',
      './modules/scheduling',
      './modules/wb',
      './modules/aircraft',
      './modules/aircraft/engine',
      './modules/errors',
      './modules/inspections',
      './modules/jobs',
      './modules/user',
      './modules/pilots',
      './modules/flightlog/manifest',
      './modules/sandbox',
      './modules/fdt',
      './modules/dispatch',
      './modules/reports',
      './modules/routeplanningGantt',
      './modules/feedback',
      './modules/flights',
    ]
    , () => {
      const app = require('./modules/app').default;
      const airports = require("./modules/airports").default;
      const scheduling = require("./modules/scheduling").default;
      const wb = require("./modules/wb").default;
      const aircraft = require("./modules/aircraft").default;
      const flightlog = require("./modules/flightlog").default;
      const engine = require("./modules/aircraft/engine").default;
      const errors = require("./modules/errors").default;
      const inspections = require("./modules/inspections").default;
      const jobs = require("./modules/jobs").default;
      const user = require("./modules/user").default;
      const pilots = require("./modules/pilots").default;
      const manifest = require("./modules/flightlog/manifest").default;
      const sandbox = require("./modules/sandbox").default;
      const fdt = require("./modules/fdt").default;
      const dispatch = require('./modules/dispatch').default;
      const reports = require('./modules/reports').default;
      const routeplanningGantt = require('./modules/routeplanningGantt').default;
      const feedback = require('./modules/feedback').default;
      const flights = require('./modules/flights').default;

      store.hotUpdate({
        modules: {
          app,
          wb,
          jobs,
          aircraft,
          airports,
          scheduling,
          sandbox,
          inspections,
          flightlog,
          engine,
          pilots,
          fdt,
          manifest,
          errors,
          user,
          dispatch,
          reports,
          routeplanningGantt,
          feedback,
          flights,
        }
      })
    }
  )
}
