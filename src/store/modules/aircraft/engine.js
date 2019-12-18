
import AircraftAPI from "../../../api/aircraft";
import * as consts from "./consts";

const initialEngine = {
  manufacturer: "",
  series: "",
  serial_number: "",
  type: "",
  base_engine_time: null,
  base_engine_cycles: null,
  base_time_last_overhaul: 0.0,
};

const state = {
  engines: [],
  opened: false,
  new_engine: Object.assign({}, initialEngine),
};

const getters = {
  engines: state => state.engines,
  activeEngines: state => state.engines.filter(engine => engine.installed_at_1 !== null || engine.installed_at_2 !== null),
  freeEngines: state => state.engines.filter(engine => engine.installed_at_1 === null && engine.installed_at_2 === null),
  newEngineOpened: state => state.opened,
  newEngine: state => state.new_engine,
};

const actions = {
  getEngines: ({commit}) => AircraftAPI.listEngines().then((engines) => commit(consts.SET_ENGINES, engines)),
  getAllEngines: ({commit}) => AircraftAPI.listAllEngines().then((engines) => commit(consts.SET_ENGINES, engines)),
  getEngine({commit}, id) {
    AircraftAPI.getEngine(id).then((engine) => {
      commit(consts.SET_NEW_ENGINE, engine);
    });
  },
  selectEngine({commit}, engine) {
    commit(consts.SET_NEW_ENGINE, engine);
  },
  pushEngine({commit}, cb) {
    AircraftAPI.pushEngine(state.new_engine).then((engine) => {
      commit(consts.ADD_ENGINE, engine);
      cb(engine);
    });
  },
  deactivateEngine({dispatch, commit}, engine) {
    commit(consts.SET_ENGINE_ACTIVE, {engine, status: false});
    return AircraftAPI.deactivateEngine(engine.id);
  },
  removeEngine({dispatch, commit}, engine) {
    return AircraftAPI.removeEngine(engine.id);
  },
  activateEngine({dispatch}, engine) {
    commit(consts.SET_ENGINE_ACTIVE, {engine, status: true});
    return AircraftAPI.activateEngine(engine.id);
  }
};

const mutations = {
  [consts.SET_NEW_ENGINE_OPENED](state, status) {
    state.opened = status;
  },
  [consts.RESET_ENGINE](state) {
    state.opened = false;
    state.new_engine = Object.assign({}, initialEngine);
  },
  [consts.SET_ENGINES](state, engines) {
    state.engines = engines;
  },
  [consts.SET_ENGINE_ACTIVE](state, {engine, status}) {
    engine.active = status;
  },
  [consts.SET_NEW_ENGINE](state, engine) {
    state.new_engine = engine;
  },
  [consts.ADD_ENGINE](state, engine) {
    state.engines.push(engine);
  },
  [consts.SET_ENGINE_MANUFACTURER](state, manufacturer) {
    state.new_engine.manufacturer = manufacturer;
  },
  [consts.SET_BASE_ENGINE_CYCLES](state, base_engine_cycles) {
    state.new_engine.base_engine_cycles = base_engine_cycles;
  },
  [consts.SET_BASE_ENGINE_HOURS](state, base_engine_time) {
    state.new_engine.base_engine_time = base_engine_time;
  },
  [consts.SET_BASE_ENGINE_LAST_OVERHAUL](state, base_time_last_overhaul) {
    state.new_engine.base_time_last_overhaul = base_time_last_overhaul;
  },
  [consts.SET_ENGINE_TYPE](state, type) {
    state.new_engine.type = type;
  },
  [consts.SET_ENGINE_SERIES](state, series) {
    state.new_engine.series = series;
  },
  [consts.SET_SERIAL_NUMBER](state, serial_number) {
    state.new_engine.serial_number = serial_number;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
