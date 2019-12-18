<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

  import iataField from 'Common/Form/Fields/AirportIATAField.vue';
  import DateTimeField from 'Common/Form/Fields/DateTimeField.vue';
  import Flight from '../Flight/BlockView.vue';

  export default {
    components: {
      iataField,
      DateTimeField,
      Flight,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'flightAssignment',
      ]),
      ...mapGetters('routeplanningGantt', [
        'selectedAircraft',
        'isBeforeAssignment',
        'isAfterAssignment',
      ]),
      iata: {
        get() {
          return this.flightAssignment.airport;
        },
        set(value) {
          this.setFlightAssignment({
            airport: value,
          });
        },
      },
      dateTime: {
        get() {
          return this.flightAssignment.dateTime;
        },
        set(value) {
          this.setFlightAssignment({
            dateTime: value,
          });
        },
      },
    },
    methods: {
      ...mapMutations('routeplanningGantt', [
        'setFlightAssignment',
      ]),
    },
  };
</script>

<template>
  <div class="aircraft-gantt-assign-desc">
    <div class="aircraft-gantt-assign-desc__aircraft">
      <div class="aircraft-gantt-assign-desc__tail-number">{{ selectedAircraft.aircraft.registration }}</div>
      <!--<div class="aircraft-gantt-assign-desc__next-mx">%4600 next mx%</div>-->
    </div>
    <div class="aircraft-gantt-assign-desc__flight-options">
      <iata-field class="aircraft-gantt-assign-desc__control"
                  :control-props="{ multiple: false, size: 'mini' }" output="id" v-model="iata" />
      <date-time-field class="aircraft-gantt-assign-desc__control"
                       :attributes="{ size: 'mini', format: 'MM/dd HH:mm' }" timezone="UTC" v-model="dateTime" />

      <div class="aircraft-gantt-assign-desc__flight">
        <div class="aircraft-gantt-assign-desc__direction">
          <div v-if="isBeforeAssignment"
               class="aircraft-gantt-assign-desc__placeholder aircraft-gantt-assign-desc__placeholder_before">
            <i class="fa fa-arrow-right" />
          </div>
          <flight v-if="flightAssignment.flight"
                  class="aircraft-gantt-assign-desc__current-flight" :flight="flightAssignment.flight" />
          <div v-if="isAfterAssignment"
               class="aircraft-gantt-assign-desc__placeholder aircraft-gantt-assign-desc__placeholder_after">
            <i class="fa fa-arrow-right" />
          </div>
        </div>
        <!--<div class="aircraft-gantt-assign-desc__mx-left">%980 left%</div>-->
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .aircraft-gantt-assign-desc {
    width: 120px;
    margin-bottom: 10px;
    &__tail-number {
      font-size: 22px;
      line-height: 22px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    &__control {
      width: 120px;
      margin-bottom: 10px;
      .el-date-editor.el-input {
        width: 100%;
      }
    }
    &__direction {
      display: flex;
      align-items: center;
    }
    &__current-flight {
      width: 75px;
    }
    &__placeholder {
      height: 24px;
      width: 24px;
      border: dashed 2px #6eb4ec;
      color: #6eb4ec;
      &_before {
        margin-right: 20px;
        position: relative;
        .fa {
          position: absolute;
          left: 27px;
          top: 3px;
        }
      }
      &_after {
        margin-left: 20px;
        position: relative;
        .fa {
          position: absolute;
          left: -18px;
          top: 3px;
        }
      }
    }
  }
</style>
