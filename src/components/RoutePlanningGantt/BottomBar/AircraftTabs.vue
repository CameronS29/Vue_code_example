<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { find } from 'lodash';

  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';
  import TailDetailed from './TailDetailed.vue';
  import Unassigned from './Unassigned.vue';

  export default {
    components: {
      TailDetailed,
      Unassigned,
      HorizontalScrollable,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'filters',
        'activeAircraftTab',
        'isAircraftTabsExpanded',
        'eCheckListMode',
      ]),
      ...mapGetters('routeplanningGantt', [
        'grid',
        'totalFlightsCount',
        'unassignedFlightsCount',
        'tabSelectedAircraft',
      ]),
      expandBtnClass() {
        return {
          'aircraft-gantt-tabs__expand': true,
          'aircraft-gantt-tabs__expand_expanded': this.isMainTabsExpanded,
        };
      },
    },
    methods: {
      ...mapMutations('routeplanningGantt', [
        'setActiveAircraftTab',
        'setDetailedViewTail',
        'setFlightAssignment',
        'toggleAircraftTabs',
      ]),
      titleClass(aircraftId) {
        return {
          'aircraft-gantt-tabs__title': true,
          'aircraft-gantt-tabs__title_active': this.activeAircraftTab === aircraftId,
        };
      },
      showTailNumberView(aircraftId) {
        this.setDetailedViewTail(aircraftId);
      },
      changeTab(aircraftId) {
        this.setFlightAssignment({
          aircraft: aircraftId,
        });
        this.setActiveAircraftTab(aircraftId);
      },
    },
  };
</script>

<template>
  <section class="aircraft-gantt-tabs">

    <header class="aircraft-gantt-tabs__header">
      <div :class="expandBtnClass" @click="toggleAircraftTabs">
        <i class="fa fa-angle-up" v-if="isAircraftTabsExpanded" />
        <i class="fa fa-angle-down" v-else />
      </div>
      <div class="aircraft-gantt-tabs__tail-number-list-wrapper">
        <horizontal-scrollable fade-color="#eaeaeb" hide-scrollbar>
          <div style="display: flex;">
            <div :class="titleClass(aircraft.aircraft.id)" @click="changeTab(aircraft.aircraft.id)"
                 :key="aircraft.aircraft.id" v-for="aircraft in grid">
              {{ aircraft.aircraft.registration }}
              <i v-if="eCheckListMode"
                 @click.stop="showTailNumberView(aircraft.aircraft.id)" class="fa fa-eye aircraft-gantt-tabs__eye" />
            </div>
          </div>

        </horizontal-scrollable>
      </div>

    </header>


    <div class="aircraft-gantt-tabs__content" v-if="isAircraftTabsExpanded">
      <tail-detailed :aircraft="tabSelectedAircraft" v-if="tabSelectedAircraft"
                     class="aircraft-gantt-tabs__tail-detailed" />
    </div>
  </section>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .aircraft-gantt-tabs {
    background: #fff;

    &__header {
      display: flex;
      background: #eaeaeb;
    }

    &__title {
      cursor: pointer;
      padding: 5px;
      display: flex;
      font-size: 12px;
      align-items: center;

      &_active {
        background: #1ab394;
        color: #fff;

        .aircraft-gantt-tabs__eye {
          color: #fff;
        }
      }
    }

    &__expand {
      cursor: pointer;
      width: 20px;
      text-align: center;
      padding: 5px 0;
      background: darken(#eaeaeb, 10%);
    }

    &__tail-number-list-wrapper {
      flex: 1 1;
      width: 1px;
    }

    &__tail-number-list {
      display: flex;
    }

    &__eye {
      margin-left: 3px;
      color: $blue;

      &:hover {
        color: $dark-blue;
      }
    }

    &__tail-detailed {

    }
  }
</style>
