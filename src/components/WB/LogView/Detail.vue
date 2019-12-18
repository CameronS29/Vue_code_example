<script>
  import Promise from 'bluebird';
  import { mapActions, mapGetters } from 'vuex';

  import ActiveTitle from 'Common/ActiveTitle';
  import LogUpdate from './Update/View.vue';
  import LogRead from './Read/View.vue';
  import LogNotFound from './NotFound/View.vue';
  import LogLoading from './LogLoading.vue';
  import LogProgress from './Common/LogProgress.vue';
  import ActiveUsers from './Common/ActiveUsers/View.vue';

  import * as consts from '../../../store/modules/wb/consts';
  import { connectMixin } from '../../../sockets';
  import activeUserMixin from './mixins/activeUserMixin';

  export default {
    mixins: [
      connectMixin(({ id }) => (id && `wb:${id}`)),
      connectMixin('wb:locks'),
      activeUserMixin,
    ],

    props: {
      id: [String, Number],
    },

    components: {
      LogRead,
      LogUpdate,
      LogNotFound,
      LogLoading,
      LogProgress,
      ActiveUsers,
      ActiveTitle,
    },

    data() {
      return {
        notFound: false,
        shoutTimer: -1,
      };
    },

    created() {
      window.addEventListener('beforeunload', this.leaveLog);
      this.getLogData();
    },

    destroyed() {
      window.removeEventListener('beforeunload', this.leaveLog);
      this.leaveLog();
    },

    methods: {
      ...mapActions('wb', [
        'reset',
        'getWBLog',
        'getAllOptions',
        'getCalculations',
        'getCGLimits',
        'resetCalculations',
      ]),

      async getLogData() {
        this.notFound = false;
        this.reset();
        this.clearUsers();
        this.declareMyself();

        try {
          await Promise.join(
            this.getAllOptions(),
            this.getCalculations(this.id),
            this.getWBLog(this.id),
          );

          if (this.aircraftType !== null) {
            await this.getCGLimits(this.aircraftType);
          }
        } catch (e) {
          this.notFound = true;
          throw e;
        }
      },
    },

    computed: {
      ...mapGetters('wb', [
        'selectedAircraftType',
        'selectedAircraft',
        'log',
      ]),

      aircraftType() {
        return this.log.aircraft_type;
      },

      logComponent() {
        if (this.notFound) {
          return 'LogNotFound';
        }

        switch (this.log.status) {
          case consts.STATUS_PIC_APPROVAL:
          case consts.STATUS_COMPLETED:
            return 'LogRead';

          case consts.STATUS_OPEN:
          case consts.STATUS_READY_FOR_APPROVAL:
            return 'LogUpdate';

          default:
            return 'LogLoading';
        }
      },
      flightNumber() {
        if (this.log.flight_data) return this.log.flight_data.flight_number;

        return this.log.flight_number;
      },
    },

    watch: {
      async id(newId) {
        if (newId !== undefined) {
          await this.getLogData();
        }
      },

      async aircraftType(id) {
        if (id) {
          this.resetCalculations();
          await this.getCGLimits(id);
        } else {
          this.resetCalculations();
        }
      },
    },
  };
</script>

<template>
  <div class="log-detail">
    <active-title
      v-if="selectedAircraft && log.id"
      :prefix="`${this.selectedAircraft.registration} (#${ flightNumber })`"
      suffix=": Weight & Balance Log - Boutique Air operations"
    />
    <transition name="log-detail-fade" mode="out-in" appear>
      <log-progress v-if="log.status > 0" :status="log.status" />
      <div v-else />
    </transition>

    <transition name="log-detail-fade" mode="out-in" appear>
      <component :is="logComponent" :id="Number(id)" />
    </transition>

    <portal to="bottom-right" :order="10">
      <transition name="log-detail-fade" mode="out-in" appear>
        <div v-if="users.length > 0" class="log-detail__users-wrapper">
          <active-users :users="users" />
        </div>
      </transition>
    </portal>
  </div>
</template>

<style lang="scss">
  .log-detail-fade {
    &-enter,
    &-leave-to {
      opacity: 0;
    }

    &-enter-to,
    &-leave {
      opacity: 1;
    }

    &-enter-active {
      transition: opacity 150ms ease-in;
    }

    &-leave-active {
      transition: opacity 150ms ease-out;
    }
  }

  .log-detail {
    color: lighten(black, 20%);
    display: flex;
    flex-direction: column;
    font-size: 14px;
    flex: 1;
  }
</style>
