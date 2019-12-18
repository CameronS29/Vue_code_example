<script>
  import { mapActions, mapGetters } from 'vuex';

  import ViewPortal from 'Common/ViewPortal.vue';
  import Columns from 'Common/Columns.vue';
  import Column from 'Common/Column.vue';

  import { FlightTypes, FlightTypeNames } from 'store/modules/fdt/consts';
  import ContainerView from '../Common/ContainerView.vue';
  import { formatDate } from '../Common/utils';
  import permissionMixin from '../../../Common/permissionMixin';

  import FlightLimitations from './FlightLimitations.vue';
  import FlightLogInfo from './FlightLogInfo.vue';
  import FlightInfo from './FlightInfo.vue';
  import PilotInputInfo from './PilotInputInfo.vue';


  export default {
    mixins: [permissionMixin],

    props: {
      pilot: Number,
      block: Object,
      log: {
        type: Object,
        default: () => ({}),
      },
    },

    components: {
      PilotInputInfo,
      FlightLogInfo,
      FlightInfo,
      FlightLimitations,
      ViewPortal,
      ContainerView,
      Columns,
      Column,
    },

    data() {
      return {
        loading: 0,
      };
    },

    methods: {
      ...mapActions('fdt/ocf', ['deleteOCF']),
      ...mapActions('fdt/legality', ['getLegality']),

      format(date) {
        return formatDate(date, this.tz);
      },

      getTypeName(type) {
        switch (type) {
          case FlightTypes.Unscheduled:
          case FlightTypes.Scheduled: return `Part 135 (${FlightTypeNames[type]})`;
          case FlightTypes.Part91: return FlightTypeNames[type];
          default: return 'Unknown';
        }
      },
    },

    computed: {
      ...mapGetters('fdt/calendar', ['tz', 'dutyFilters', 'isOnPublishedRevision']),

      loaded() {
        return this.loading === 0;
      },

      isScheduled() {
        return this.block.flight_type === FlightTypes.Scheduled;
      },
      isUnscheduled() {
        return this.block.flight_type === FlightTypes.Unscheduled;
      },
    },
  };
</script>

<template>
  <columns :cols="3" v-loading="!log.id && block.flightlog" class="block-time-info-columns">
    <column>
      <container-view title="Block Time">
        <div class="blocktime__part">
          <div class="blocktime__part__time blocktime__part__time_in">
            <div class="blocktime__title">Time OUT</div>
            <div class="blocktime__value">
              {{ format(block.datetime_on) }}
            </div>
          </div>
          <div class="blocktime__part__time blocktime__part__time_out">
            <div class="blocktime__title">Time IN</div>
            <div class="blocktime__value">
              {{ format(block.datetime_off) }}
            </div>
          </div>
          <div class="blocktime__part__time blocktime__part__time_typeop">
            <div class="blocktime__title">Operating Under</div>
            <div class="blocktime__value">
              {{ getTypeName(block.flight_type) }}
            </div>
          </div>
        </div>
        <span slot="icons" v-if="block.flightlog">
          <a target="_blank" class="btn btn-default btn-xs"
             :href="'/dispatch/manifest/' + block.flightlog.manifest_id + '/view/'">
            <i class="fa fa-eye"></i>
          </a>
          <a target="_blank" class="btn btn-default btn-xs"
             :href="'/flightlog/pdf-report/' + block.flightlog.manifest_id + '/'">
            <i class="fa fa-file-pdf-o"></i>
          </a>
        </span>
      </container-view>

      <flight-limitations :block="block" v-if="isScheduled || isUnscheduled" />
    </column>

    <column :shrink="true">
      <flight-log-info :log="log" v-if="log.id" />
      <flight-info v-else-if="block.flight" :flight="block.flight" />
    </column>

    <column :grow="true">
      <pilot-input-info :log="log" v-if="log.id" />
    </column>
  </columns>
</template>

<style lang="scss">
  @import '../../../../../../scss/bs-variables';

  .block-time-info-columns {
    min-height: 300px;
    overflow-y: auto;
    @media screen and (max-width: $screen-xs-max) {
      flex-flow: column !important;
    }
  }

  .blocktime__part {
    display: flex;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .blocktime__prop-group {
    margin-bottom: 15px;
  }

  .blocktime__part__time {
    flex-grow: 5;
    margin: 0 5px;
  }

  .blocktime__part__time_typeop {
    flex-grow: 6;
  }

  .blocktime__title {
    font-size: 1em;
    font-weight: 600;
    padding: 5px 0;
  }

  .blocktime__value {
    font-size: 0.9em;
  }

  .checks__title {
    font-size: 1em;
    font-weight: 600;
    padding: 5px 0;
  }
</style>
