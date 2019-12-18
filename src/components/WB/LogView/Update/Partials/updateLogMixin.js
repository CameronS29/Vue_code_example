import { mapGetters, mapActions } from 'vuex';
import { isFinite, identity } from 'lodash';
import { Notification } from 'element-ui';


export function toNumber(value) {
  const convValue = parseInt(value, 10);
  return isFinite(convValue)
    ? convValue
    : null;
}

export const logProperty = (propName, mapper = identity) => ({
  get() {
    return this.log[propName];
  },
  set(value) {
    this.setPartialUpdate({
      [propName]: mapper(value),
    });
    this.$emit('update:log');
  },
});

export const videcomDependant = ({ get, set }) => ({
  get,
  set(value) {
    if (!set) {
      return;
    }

    if (this.log.videcom_fetched && !this.$videcomAlert) {
      this.$videcomAlert = Notification({
        type: 'warning',
        title: 'Videcom Update Reminder',
        message: 'Don\'t forget to update passengers from Videcom',
        duration: 5000,
        offset: 40,
        onClose: () => {
          this.$videcomAlert = undefined;
        },
      });
    }

    set.call(this, value);
  },
});


export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  computed: mapGetters('wb', ['log', 'isLoading', 'getCalcValue']),
  methods: mapActions('wb', ['setPartialUpdate']),
};
