import { mapGetters, mapActions, mapMutations } from 'vuex';
import * as consts from '../../../../store/modules/wb/consts';

export default {
  props: {
    id: Number,
    hideButtons: Boolean,
  },

  computed: {
    ...mapGetters('wb', [
      'log',
      'isLoading',
      'detailed',
      'saved',
      'selectedAircraft',
      'selectedAircraftType',
      'readyForApproval',
      'readyForDispatch',
      'showLockFields',
      'isBlocked',
      'blockingUser',
      'securityAware',
      'securityRestriction',
    ]),

    ...mapGetters('user', ['user', 'isAdmin']),

    canDelete() {
      return this.isAdmin || this.log.status < consts.STATUS_PIC_APPROVAL;
    },

    calcColumnClasses() {
      return this.detailed
        ? { 'wb-detail__full': true }
        : {
          'wb-detail__form': true,
          'wb-detail__form_locks': this.showLockFields,
        };
    },

    graphColumnClasses() {
      return this.detailed
        ? { 'wb-detail__full': true }
        : {
          'wb-detail__graph': true,
          'wb-detail__graph_locks': this.showLockFields,
        };
    },
  },

  methods: {
    ...mapActions('wb', [
      'softReset',
    ]),

    ...mapMutations('wb', [
      consts.UPDATE_LOG,
      consts.SET_BLOCK,
    ]),
  },
};
