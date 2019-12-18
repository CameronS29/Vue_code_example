<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import {Row, Col} from 'element-ui';
  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import FlightFilter from './FlightFilter.vue';
  import FlightTable from './FlightTable.vue';
  import UnscheduledFlight from './UnscheduledFlight.vue';
  import manifestApi from "../../../../../api/pilotManifest";

  export default {
    props: {
      createLog: {
        type: Boolean,
        default: true,
      },
      showUnscheduled: {
        type: Boolean,
        default: true,
      },
      wbFlights: {
        type: Boolean,
        default: false,
      },
      securityPick: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        saving: false
      }
    },
    components: {
      ElRow: Row,
      ElCol: Col,
      Modal,
      Card,
      FlightFilter,
      FlightTable,
      UnscheduledFlight,
    },

    computed: {
      ...mapState('pilotManifest/pickFlight', ['showFlightFilterModal']),
      ...mapGetters('pilotManifest/pickFlight', ['filterData']),
      ...mapGetters('pilotManifest', ['manifest']),
    },

    methods: {
      ...mapActions('pilotManifest/pickFlight', ['getFlights', 'reset']),

      handlePickFlight(flightId) {
        if (this.createLog) {
          this.saving = true;
          manifestApi.createLog({manifest: this.manifest.id, flight: flightId})
          .catch((res)=>{
            this.$notify({
              type: 'error',
              title: 'Cannot create new flightlog',
              message: 'Check your network connection or try again later',
            });
          })
          .then((res)=>{
            this.reset();
            this.$emit('log:created', res);
          }).finally(()=>this.saving=false)
        } else {
          this.$emit('flight:picked', flightId);
        }
      },
    },
  };
</script>

<template>
  <modal :show="showFlightFilterModal" @close="reset" transparent>
      <card mode="dark" class="log-modal__card">
        <el-row :gutter="40">
          <el-col :sm="24" :md="showUnscheduled ? 16 : 24">
            <flight-filter />
            <flight-table :filters="filterData"
                          :saving="saving"
                          :securityPick="securityPick"
                          :wb-flights="wbFlights"
                          @wb-log-click="log => $emit('wb-log-click', log)"
                          @flight:picked="handlePickFlight" />
          </el-col>
          <el-col :sm="24" :md="8" v-if="showUnscheduled">
            <unscheduled-flight />
          </el-col>
        </el-row>
      </card>
  </modal>
</template>


<style lang="scss">
  @import '../../../../../../scss/bs-variables';
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

  .log-modal {
    &__card {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      width: 90vw;
      min-height: 80vh;
      padding: 15px;
      overflow: auto;
      &.card_dark {
        color: inherit;
      }

      .btq-form__label {
        margin-bottom: 0;
      }
    }

    &__title {
      margin-bottom: 15px;
      font-weight: bold;
      font-size: 24px;
      color: white;
    }

    @media screen and (max-width: $screen-md-max) {
      &__content {
        flex-wrap: wrap;
      }
    }
  }
</style>
