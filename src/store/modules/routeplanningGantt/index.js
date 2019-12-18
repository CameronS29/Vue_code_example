import { DateTime } from 'luxon';
import { groupBy, find, sortBy, orderBy, last, keyBy,
  findKey, map, max, min, uniqBy, partition, throttle } from 'lodash';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import compareAsc from 'date-fns/compareAsc';
import compareDesc from 'date-fns/compareDesc';
import toDate from 'date-fns/toDate';
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping';

import api from 'api/routeplanning/new';
import { TAIL_STATUS_ORDER } from 'store/modules/dispatch/e-checklist';
import aircraftApi from 'api/aircraft';
import lines from './lines';
import routes from './routes';
import {
  getDeparture, getArrival, getDestination, getOrigin,
  getConflictingFlightIds, filterBySearchQuery
} from './utils';
import { getPIC, getSIC, pilotName } from 'store/modules/routeplanningGantt/utils';

export const BEFORE_FLIGHT = 'BEFORE_FLIGHT';
export const AFTER_FLIGHT = 'AFTER_FLIGHT';

export const UNASSIGNED_TAB = 'UNASSIGNED_TAB';
export const TAIL_VIEW_TAB = 'TAIL_VIEW_TAB';
export const CREW_GANTT_TAB = 'CREW_GANTT_TAB';

export const CONFLICT_COLOR_CODING = 'Conflict';
export const HOBBS_COLOR_CODING = 'Hobbs';
export const STATUS_COLOR_CODING = 'Status';
export const OPERATION_COLOR_CODING = 'Operation';
export const COLOR_CODING_OPTIONS = [CONFLICT_COLOR_CODING, HOBBS_COLOR_CODING, STATUS_COLOR_CODING,
  OPERATION_COLOR_CODING];
const SECONDS_IN_DAY = 60 * 60 * 24;
const CURRENT_DATETIME = DateTime.utc();

export default {
  namespaced: true,
  state: {
    eCheckListMode: false,
    detailedViewTailId: null,
    detailedViewRange: 24, // flight filter

    filters: {
      dateStart: CURRENT_DATETIME.startOf('week')
        .minus({ days: 1 })
        .toISO(),
      dateEnd: CURRENT_DATETIME.endOf('week')
        .minus({ days: 1 })
        .toISO(),
      live: false,
      searchQuery: '',
      aircrafts: [],
    },
    sort: {
      tailNumber: 1,
      status: 0,
      hobbs: 0,
    },
    ganttTableRange: 24,
    colorCoding: CONFLICT_COLOR_CODING,

    flightAssignment: {
      aircraft: null,
      flight: null,

      airport: null,
      dateTime: null,

      assignmentPosition: BEFORE_FLIGHT,
    },

    assignedFlights: [],
    unassignedFlights: [],

    /**
     * tabs
     */
    isMainTabsExpanded: true,
    isAircraftTabsExpanded: true,
    activeMainTab: UNASSIGNED_TAB,
    activeAircraftTab: null,

    unassignedSearchFilter: null,
    lastAssigned: null,
    observableDate: CURRENT_DATETIME.startOf('month')
      .toISO(),

    batchRemoveRootFlight: null,

    /**
     * selection mode
     */
    isInSelectionMode: false,
    selectedFlights: [],
  },
  getters: {
    /**
     * tabs
     */
    gridFullHeight: (state, { grid }, { app: { windowHeight } }) => {
      return grid.length * 20 + 25 + 17;
    },
    unassignedFullHeight: (state, { unassignedPlacementMap }) => {
      const MIN_HEIGHT = 70;
      return max([unassignedPlacementMap.length * 20, MIN_HEIGHT]);
    },
    pilotGridFullHeight: (state, { pilotList, gridFullHeight }) => {
      const MIN_HEIGHT = 70;
      return min([gridFullHeight, max([pilotList.length * 20, MIN_HEIGHT])]);
    },
    tailDetailedFullHeight: (state, getters, { app: { windowHeight } }) => {
      return windowHeight - 70;
    },
    aircraftFullHeight: (state, { tabSelectedAircraft }) => {
      if (!tabSelectedAircraft) return 0;
      const HEADER_HEIGHT = 25;

      return tabSelectedAircraft.flights.length * 23 + 20 + HEADER_HEIGHT;
    },
    fullHeight: (state, getters) => {
      let height = 0; // tab headers
      height += getters.gridFullHeight;

      if (state.isMainTabsExpanded) {
        if (state.activeMainTab === UNASSIGNED_TAB) {
          height += getters.unassignedFullHeight;
        } else if (state.activeMainTab === CREW_GANTT_TAB) {
          height += getters.pilotGridFullHeight;
        } else if ((state.activeMainTab === TAIL_VIEW_TAB) && state.detailedViewTailId) {
          height += getters.tailDetailedFullHeight;
        }
      }

      if (state.isAircraftTabsExpanded && state.activeAircraftTab) {
        height += getters.aircraftFullHeight;
      }

      return height;
    },
    dynamicAreasHeight: (state, { grid }, { app: { windowHeight } }) => {
      return windowHeight - 25 - 25 - 70;
    },

    detailedViewTail: ({ detailedViewTailId }, { grid }) => {
      return find(grid, aircraft => aircraft.aircraft.id === detailedViewTailId);
    },
    isBeforeAssignment: ({ flightAssignment: { assignmentPosition } }) => assignmentPosition === BEFORE_FLIGHT,
    isAfterAssignment: ({ flightAssignment: { assignmentPosition } }) => assignmentPosition === AFTER_FLIGHT,
    flightsGroupedByFlightNumber: ({ unassignedFlights, assignedFlights }) => {
      return {
        unassigned: groupBy(unassignedFlights, 'flight_number'),
        assigned: groupBy(assignedFlights, 'flight_number'),
      };
    },
    unassignedFlightsCount: ({ unassignedFlights }) => unassignedFlights.length,
    selectedAircraft: ({ flightAssignment }, { grid }) => {
      if (!flightAssignment.aircraft) return undefined;

      return find(grid, aircraft => aircraft.aircraft.id === flightAssignment.aircraft);
    },
    totalFlightsCount: ({ assignedFlights, unassignedFlights }) => unassignedFlights.length + assignedFlights.length,
    allFlightsMap: ({ assignedFlights, unassignedFlights }) => keyBy([...assignedFlights, ...unassignedFlights], 'id'),
    gridStartDate: ({ filters }, { isNowInTimeFrame }) => {
      const start = DateTime.fromISO(filters.dateStart, { zone: 'utc' });

      if (isNowInTimeFrame) {
        return CURRENT_DATETIME;
      }

      return start;
    },
    grid: (state, getters, rootState, rootGetters) => {
      const aircrafts = rootGetters['aircraft/aircrafts'];
      const groupedFlights = groupBy(state.assignedFlights, flight =>
        flight.actual_aircraft || (state.filters.live ? flight.assigned_aircraft : flight.draft_aircraft));

      const grid = aircrafts.map((aircraft) => {
        const flights = sortBy(groupedFlights[aircraft.id], flight => getArrival(flight));
        const conflictingFlightIds = getConflictingFlightIds(flights);

        return {
          aircraft: {
            ...aircraft,
            conflictingFlightIds,
          },
          flights: filterBySearchQuery(flights.map((flight) => {
            if (conflictingFlightIds.includes(flight.id)) {
              return {
                ...flight,
                isConflicting: true,
              };
            }

            return flight;
          }), state.filters.searchQuery),
          nextMx: parseFloat(aircraft.next_mx),
          lastFlightId: flights.length > 0 ? flights.slice(-1)[0].id : 0,
        };
      });

      const filtered = grid.filter((aircraft) => {
        if (!state.filters.aircrafts.length) return true;

        return state.filters.aircrafts.includes(aircraft.aircraft.id);
      });

      const sorted = filtered.sort(({ aircraft: aircraft1 }, { aircraft: aircraft2 }) => {
        const sort = findKey(state.sort, sort => !!sort);

        if (sort === 'tailNumber') {
          return aircraft1.registration > aircraft2.registration ? state.sort[sort] : -state.sort[sort];
        } else if (sort === 'hobbs') {
          const getRemainingHobbs = (aircraft) => {
            const projHobbs = state.filters.live ? aircraft.projected_hobbs : aircraft.projected_hobbs_draft;

            return aircraft.next_mx - projHobbs;
          };

          return getRemainingHobbs(aircraft1) > getRemainingHobbs(aircraft2) ? state.sort[sort] : -state.sort[sort];
        } else if (sort === 'status') {
          return TAIL_STATUS_ORDER.indexOf(aircraft1.status) > TAIL_STATUS_ORDER.indexOf(aircraft2.status)
            ? state.sort[sort]
            : -state.sort[sort];
        }

        return null;
      });

      return sorted;
    },
    pilotList: (state, getters, rootState, rootGetters) => {
      const fullList = rootGetters['scheduling/gantt/formattedList'];
      const search = state.filters.searchQuery;
      let searchFilteredList = fullList;

      if (search.length) {
        const pilotsMatched = fullList.filter(row => row.name.toUpperCase().indexOf(search.toUpperCase()) > -1);
        searchFilteredList = pilotsMatched.length
          ? pilotsMatched
          : fullList.map(row => ({
            ...row,
            blocks: row.blocks.filter(block => block.flight_number.toUpperCase()
              .indexOf(search.toUpperCase()) > -1),
          }));
      }

      return searchFilteredList.filter(row => row.blocks.length);
    },
    daysInFilterDateRange: (_, { ganttDateRangeISO }) => {
      const diff = differenceInSeconds(ganttDateRangeISO[1], ganttDateRangeISO[0]);
      return diff / SECONDS_IN_DAY;
    },
    isFlightAssignmentValid: ({ flightAssignment }) => flightAssignment.aircraft && flightAssignment.dateTime,
    ganttDateRange: ({ filters }) => {
      const parse = date => DateTime.fromISO(date, { zone: 'UTC' });

      return [
        parse(filters.dateStart)
          .minus({ days: 1 }),
        parse(filters.dateEnd)
          .plus({ days: 1 }),
      ];
    },
    ganttDateRangeISO: (_, { ganttDateRange }) => {
      return ganttDateRange.map(date => date.toISO());
    },
    unassignedPlacementMap: ({ unassignedFlights: flights }) => {
      const levels = [[]];
      const sortedFlights = sortBy(flights, flight => toDate(getDeparture(flight)));

      for (const flight of sortedFlights) {
        let filled = false;

        for (let i = 0; (i < levels.length) && !filled; ++i) {
          const top = levels[i][levels[i].length - 1];
          if (top === undefined || compareAsc(getArrival(top), getDeparture(flight)) === -1) {
            levels[i].push(flight);
            filled = true;
          }
        }

        if (!filled) {
          levels.push([flight]);
        }
      }

      return levels;
    },
    filteredUnassignedPlacementMap: ({ unassignedSearchFilter }, { unassignedPlacementMap }) => {
      if (!unassignedSearchFilter) return unassignedPlacementMap;

      return unassignedPlacementMap.map(level => level.filter(flight => [
        getDestination(flight).iata,
        getOrigin(flight).iata,
        flight.flight_number,
      ].join('')
        .indexOf(unassignedSearchFilter.toUpperCase()) > -1));
    },
    apiCompatibleFilters: ({ filters }, { ganttDateRange }) => {
      return {
        scheduled_departure_0: ganttDateRange[0].toISO(),
        scheduled_arrival_1: ganttDateRange[1].toISO(),
        live: filters.live ? 1 : 0,
      };
    },
    suggestedFlights: ({ unassignedFlights, flightAssignment }, { isFlightAssignmentValid }) => {
      if (!isFlightAssignmentValid) return [];

      const filteredFlights = unassignedFlights.filter((flight) => {
        if (flightAssignment.assignmentPosition === BEFORE_FLIGHT) {
          return (flightAssignment.airport === getDestination(flight).id)
            && (compareDesc(
              getArrival(flight),
              flightAssignment.dateTime,
            ) === 1);
        }

        return (flightAssignment.airport === getOrigin(flight).id)
          && (compareDesc(
            flightAssignment.dateTime,
            getDeparture(flight),
          ) === 1);
      });

      return orderBy(filteredFlights, ['scheduled_departure'], [
        flightAssignment.assignmentPosition === BEFORE_FLIGHT ? 'desc' : 'asc',
      ]);
    },
    batchRemoveNextFlights: ({ batchRemoveRootFlight, filters }, { grid }) => {
      if (!batchRemoveRootFlight) return [];

      const aircraftId = filters.live
        ? batchRemoveRootFlight.assigned_aircraft
        : batchRemoveRootFlight.draft_aircraft;
      const sameAircraftAssignedFlights = grid.find(({ aircraft }) => aircraft.id === aircraftId).flights;


      return sameAircraftAssignedFlights.filter((flight) => {
        return (compareDesc(
          getArrival(batchRemoveRootFlight),
          getArrival(flight),
        ) !== -1);
      });
    },
    isNowInTimeFrame: ({ filters }, { ganttDateRange }) => {
      const currentDate = DateTime.local();
      return (currentDate > ganttDateRange[0]) && (currentDate < ganttDateRange[1]);
    },
    tabSelectedAircraft: ({ activeAircraftTab }, { grid }) => {
      if (!activeAircraftTab) return undefined;

      return find(grid, ({ aircraft }) => aircraft.id === activeAircraftTab);
    },
  },
  actions: {
    async updateFilters({ commit, dispatch, state, getters }, filters) {
      commit('updateFilters', filters);

      dispatch('fetchGrid');
      dispatch('fetchUnassigned');
    },
    async fetchGrid({ commit, state, getters }) {
      const flights = await api.getFlights({
        ...getters.apiCompatibleFilters,
        assigned: 1,
      });
      commit('setAssigned', flights);
    },
    async fetchUnassigned({ commit, state, getters }) {
      const flights = await api.getFlights({
        ...getters.apiCompatibleFilters,
        live: 0,
        assigned: 0,
      });
      commit('setUnassigned', flights);
    },
    async assignFlight({ dispatch }, flight) {
      await dispatch('assignFlights', { flights: [flight] });
    },
    async assignFlights({ commit, state }, { flights, aircraft }) {
      const aircraftId = aircraft || state.flightAssignment.aircraft;
      commit('assignFlights', {
        flights,
        aircraftId,
      });
      const flight = last(flights);
      commit('setFlightAssignment', {
        flight,
        airport: state.flightAssignment.assignmentPosition === BEFORE_FLIGHT
          ? getOrigin(flight).id
          : getDestination(flight).id,
        dateTime: state.flightAssignment.assignmentPosition === BEFORE_FLIGHT
          ? getDeparture(flight)
          : getArrival(flight),
      });

      try {
        await api.assignFlights({
          aircraft: aircraftId,
          flights: flights.map(flight => flight.id),
          live: !!state.filters.live,
        });
      } catch (e) {
        flights.forEach(flight => commit('unAssignFlights', [{ ...flight }]));
      }
    },
    async unAssignFlight({ commit, state, dispatch }, flight) {
      await dispatch('unAssignFlights', [flight]);
    },
    async unAssignFlights({ commit, state }, flights) {
      commit('unAssignFlights', flights);

      try {
        await api.assignFlights({
          aircraft: null,
          flights: flights.map(flight => flight.id),
          live: !!state.filters.live,
        });
      } catch (e) {
        flights.forEach(flight => commit('assignFlights', {
          flights: [{ ...flight }],
          aircraftId: flight.draft_aircraft,
        }));
      }
    },
    async publish({ dispatch }) {
      await api.publish();

      dispatch('updateFilters', { live: true });
    },
    async changeMode({ commit, dispatch }, eCheckListModeEnabled) {
      commit('setECheckListMode', eCheckListModeEnabled);
      commit('setColorCoding', eCheckListModeEnabled ? STATUS_COLOR_CODING : CONFLICT_COLOR_CODING);
      const dateStart = eCheckListModeEnabled
        ? CURRENT_DATETIME.startOf('day')
          .toISO()
        : CURRENT_DATETIME.startOf('week')
          .minus({ days: 1 })
          .toISO();
      const dateEnd = eCheckListModeEnabled
        ? CURRENT_DATETIME.endOf('day')
          .toISO()
        : CURRENT_DATETIME.endOf('week')
          .minus({ days: 1 })
          .toISO();

      commit('updateFilters', {
        dateStart,
        dateEnd,
        live: eCheckListModeEnabled,
      });
    },
    async patchDetailedViewTail({ commit, state, dispatch }, props) {
      const aircraft = await aircraftApi.patchAircraft({ id: state.detailedViewTailId, ...props });

      commit('aircraft/PATCH_AIRCRAFT', {
        id: aircraft.id,
        mixin: aircraft,
      }, { root: true });
    },

    async patchFlights({ commit, state, getters, dispatch }, flights) {
      const filteredFlights = flights.filter((flight) => {
        if (!getDeparture(flight) || !getArrival(flight)) {
          return !!getters.allFlightsMap[flight.id];
        }

        return areIntervalsOverlapping(
          { start: getters.ganttDateRangeISO[0], end: getters.ganttDateRangeISO[1] },
          { start: getDeparture(flight), end: getArrival(flight) },
        );
      });

      if (!filteredFlights.length) return false;

      const [availableFlights, newFlights] = partition(filteredFlights, flight => getters.allFlightsMap[flight.id]);
      const availableFlightsMap = keyBy(availableFlights, 'id');

      const updatedFlightList = [
        ...map(getters.allFlightsMap, (flight) => {
          if (!availableFlightsMap[flight.id]) return flight;

          return {
            ...flight,
            ...availableFlightsMap[flight.id],
          };
        }),
        ...newFlights,
      ];

      const [assignedFlights, unassignedFlights] = partition(updatedFlightList, flight =>
        flight.actual_aircraft || (state.filters.live ? flight.assigned_aircraft : flight.draft_aircraft));

      commit('setAssigned', assignedFlights);
      commit('setUnassigned', unassignedFlights);

      if (state.activeMainTab === CREW_GANTT_TAB) {
        dispatch('refreshCrewGantt');
      }
    },

    refreshCrewGantt: throttle(({ getters, dispatch }) => {
      dispatch('scheduling/gantt/fetch', { dates: getters.ganttDateRangeISO }, { root: true });
    }, 5e3, {
      leading: false,
      trailing: true,
    }),
  },
  mutations: {
    updateFilters(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    updateSort(state, sort) {
      state.sort = {
        ...{
          tailNumber: 0,
          status: 0,
          hobbs: 0,
        },
        ...sort,
      };
    },
    setFlightAssignment(state, flightAssignmentOptions) {
      state.flightAssignment = {
        ...state.flightAssignment,
        ...flightAssignmentOptions,
      };
    },
    resetFlightAssignment(state) {
      state.flightAssignment = {
        aircraft: null,
        flight: null,

        airport: null,
        dateTime: null,

        assignmentPosition: BEFORE_FLIGHT,
      };
    },
    setUnassigned(state, flights) {
      state.unassignedFlights = flights;
    },
    setAssigned(state, flights) {
      state.assignedFlights = flights;
    },
    setGanttTableRange(state, range) {
      state.ganttTableRange = range;
    },
    assignFlights(state, { flights, aircraftId }) {
      const flightIds = flights.map(flight => flight.id);

      state.assignedFlights = [
        ...state.assignedFlights.filter(assignedFlight => !flightIds.includes(assignedFlight.id)),
        ...flights.map(flight => ({
          ...flight,
          draft_aircraft: aircraftId,
        })),
      ];
      state.unassignedFlights = state.unassignedFlights
        .filter(unassignedFlight => !flightIds.includes(unassignedFlight.id));
    },
    unAssignFlights(state, flights) {
      const flightIds = flights.map(flight => flight.id);

      state.assignedFlights = state.assignedFlights.filter(assignedFlight => !flightIds.includes(assignedFlight.id));
      state.unassignedFlights = [
        ...state.unassignedFlights,
        ...flights.map(flight => ({
          ...flight,
          isConflicting: false,
        })),
      ];
    },
    setUnassignedSearchFilter(state, query) {
      state.unassignedSearchFilter = query;
    },
    setLastAssigned(state, flight) {
      state.lastAssigned = flight;
    },
    setActiveMainTab(state, tabName) {
      state.activeMainTab = tabName;
      state.isMainTabsExpanded = true;
    },
    setActiveAircraftTab(state, tabName) {
      state.activeAircraftTab = tabName;
      state.isAircraftTabsExpanded = true;
    },
    toggleMainTabs(state) {
      state.isMainTabsExpanded = !state.isMainTabsExpanded;
    },
    toggleAircraftTabs(state) {
      state.isAircraftTabsExpanded = !state.isAircraftTabsExpanded;
    },
    setECheckListMode(state, mode) {
      state.eCheckListMode = mode;
    },
    setDetailedViewTail(state, tailId) {
      state.detailedViewTailId = tailId;
      state.isMainTabsExpanded = true;
      state.activeMainTab = TAIL_VIEW_TAB;
    },
    setObservableDate(state, date) {
      state.observableDate = date;
    },
    setBatchRemoveRootFlight(state, flight) {
      state.batchRemoveRootFlight = flight;
    },
    setColorCoding(state, colorCoding) {
      state.colorCoding = colorCoding;
    },
    setSelectMode(state, flag) {
      state.isInSelectionMode = flag;
    },
    setSelectedFlights(state, flights) {
      state.selectedFlights = flights;
    },
    addToSelectedFlights(state, flight) {
      state.selectedFlights = uniqBy([...state.selectedFlights, flight], flight => flight.id);
    },
    removeFromSelectedFlights(state, flight) {
      state.selectedFlights = state.selectedFlights.filter(selectedFlight => selectedFlight.id !== flight.id);
    },
    clearSelectedFlights(state) {
      state.selectedFlights = [];
    },
  },
  modules: {
    lines,
    routes,
  },
};

