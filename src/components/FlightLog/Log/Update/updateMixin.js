import { isFinite, identity } from 'lodash';
import { mapGetters, mapActions } from 'vuex';


export function toNumber(value) {
  const convValue = parseInt(value, 10);
  return isFinite(convValue)
    ? convValue
    : null;
}

export function toFloat(value) {
  const convValue = parseFloat(value);
  return isFinite(convValue)
    ? convValue
    : null;
}


export const logProperty = (propName, mapper = identity) => ({
  get() {
    const v = this.flightlog[propName];
    if (v || v === 0 || v === false) {
      return mapper ? mapper(v) : v;
    }
    return '';
  },
  set(value) {
    const newVal = mapper(value);
    if (this.flightlog[propName] !== newVal) {
      this.setPartialUpdate({
        [propName]: newVal,
      });

      this.$v[propName].$touch();
      this.$parent.partialSaveFlightlog();
    }
  },
});

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  computed: mapGetters('flightlog', [
    'flightlog',
  ]),

  methods: mapActions('flightlog', [
    'setPartialUpdate',
  ]),
};
