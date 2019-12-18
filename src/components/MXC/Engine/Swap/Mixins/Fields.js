import {RESET_ENGINE, SET_NEW_ENGINE_OPENED, UPDATE_SWAP} from "../../../../../store/modules/aircraft/consts";
import {mapGetters, mapMutations} from 'vuex';
import {
  RESET_PAGE,
  SET_DATETIME_OUT_1,
  SET_DATETIME_OUT_2,
  SET_IS_LAST_FILTER,
  SET_SELECTED_ID
} from "../../../../../store/modules/flightlog/consts";
import {DateTime} from 'luxon';
const DATE_FORMAT = "MM/DD/YYYY";
export const LUXON_DATE_FORMAT = "MM/dd/yyyy";


const swapField = function (field, processor, getter) {
  return {
    get() {
      if (getter && this.swap[field]) {
        return getter(this.swap[field]);
      }
      return this.swap[field];
    },
    set(value) {
      let payload = {};
      if (processor) {
        value = processor(value);
      }
      payload[field] = value;
      this[UPDATE_SWAP](payload);
    },
  }
};
const swapIntField = (field) => swapField(field, parseInt);
const swapDateField = (field) => swapField(
  field,
  (value) => DateTime.fromString(value, LUXON_DATE_FORMAT, {zone: 'utc'}).toISO(),
  (value) => DateTime.fromISO(value).toFormat(LUXON_DATE_FORMAT),
);
const swapFloatField = (field) => swapField(field, parseFloat);
const swapTextField = (field) => swapField(field);

export default {
  computed: {
    ...mapGetters("aircraft/engineSwap", [
      "swap",
      "notDefaultValue",
      "defaultValue",
      "originalSwap",
      "aircraft",
      "lastLog",
      "engine",
      "swapType",
      "selectedAircraft",
      "selectedSwap"
    ]),
    swapDate: swapDateField("date_for_swap"),
    removalDate: swapDateField("date_of_removal"),
    installDate: swapDateField("date_of_install"),
    swapEngine: swapIntField("engine"),
    selectedLog: swapIntField("last_log"),
    timeAtInstall: swapFloatField("time_at_install"),
    cyclesAtInstall: swapFloatField("cycles_at_install"),
    comments: swapTextField("comments")
  },
  watch: {
    installDate(value) {
      if (value) {
        this[SET_DATETIME_OUT_2](
          DateTime.fromString(value, LUXON_DATE_FORMAT, {zone: "UTC"}).endOf('day').toISO({
            suppressMilliseconds: true
          })
        );
        this[RESET_PAGE]();
        this.updateFlightLog();
      }
    },
    swapEngine(value) {
      if (this.selectedSwap) {
        this.selectEngine(this.selectedSwap);
        this.updateEngineTimes(this.log.actual_datetime_out);
        this[SET_NEW_ENGINE_OPENED](false);
      }
    },
    selectedLog(value) {
      if (value) {
        this.getFlightLog(value).then(() => {
          if (this.selectedSwap) {
            this.updateEngineTimes(this.log.actual_datetime_out);
          }
        });
      }
    }
  },
  methods: {
    ...mapMutations("aircraft/engineSwap", [
      UPDATE_SWAP
    ]),
    ...mapMutations("flightlog", [
      RESET_PAGE,
      SET_DATETIME_OUT_1,
      SET_DATETIME_OUT_2,
      SET_IS_LAST_FILTER,
      SET_SELECTED_ID
    ]),
  }
}
