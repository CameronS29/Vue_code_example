import isFinite from 'lodash/isFinite';
import identity from 'lodash/identity';
import Notification from 'element-ui/lib/notification';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { SET_VALIDATE_STATUS } from '../../../../../store/modules/pilotManifest/consts';

export function toNumber(value) {
  const convValue = parseInt(value, 10);
  return isFinite(convValue)
    ? convValue
    : null;
}

export const logProperty = (propName, mapper = identity) => ({
  get() {
    return this.manifest[propName] || '';
  },
  set(value) {
    this.setPartialUpdate({
      [propName]: mapper(value),
    });
    this.$emit('update:manifest');
  },
});

export const validateEvent = {

}

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters('pilotManifest', [
      'manifest',
      'validateTryCount',
    ]),
  },

  methods: {
    ...mapActions('pilotManifest', [
      'setPartialUpdate',
    ]),
    ...mapMutations('pilotManifest', [
      SET_VALIDATE_STATUS,
    ]),
    runValidation(newVal, oldVal) {
      this.$v.$touch();
      this[SET_VALIDATE_STATUS](this.$v.$error);
    }
  },
  watch: {
    validateTryCount: 'runValidation'
  }
};
