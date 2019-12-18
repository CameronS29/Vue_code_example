<script>
  import { mapMutations } from 'vuex';
  import * as consts from 'store/modules/scheduling/consts';
  import scheduleRowMixin from './utils/scheduleRowMixin';

  export default {
    name: 'PilotListItem',
    mixins: [scheduleRowMixin],

    props: {
      totals: Object,
    },

    computed: {
      legalMarkClasses() {
        return {
          'scheduling-pilot-item__legal-mark': true,
          'scheduling-pilot-item__legal-mark_legal': this.totals.is_legal,
          'scheduling-pilot-item__legal-mark_illegal': !this.totals.is_legal,
        };
      },
    },

    methods: {
      ...mapMutations('scheduling/calendar', [
        consts.SET_HIGHLIGHTED_PILOT,
        consts.SET_SHOW_FDT_CALENDAR_PILOT,
      ]),

      handleFullNameClick() {
        this[consts.SET_HIGHLIGHTED_PILOT](this.pilot.id);
        this[consts.SET_SHOW_FDT_CALENDAR_PILOT](this.pilot);
      },
    },

    filters: {
      fullname(pilot) {
        return `${pilot.first_name} ${pilot.last_name}`;
      },

      rank(rankId) {
        return consts.PILOT_RANKS[rankId];
      },
    },
  };
</script>

<template>
  <div @mouseover="$emit('hover-pilot-row', pilot.id)"
       class="list-item scheduling-pilot-item"
       :class="{ 'list-item_highlighted': highlighted }"
       :style="rowStyle">
    <a class="column" :title="pilot | fullname" @click.prevent.stop="handleFullNameClick">
      <div class="scheduling-pilot-item__full-name">
        <span>{{ pilot | fullname }}</span>
        <span v-if="!isPilotView" :class="legalMarkClasses">
          <i class="fa fa-fw fa-check" v-if="totals.is_legal" />
          <i class="fa fa-fw fa-times" v-else />
        </span>
      </div>
    </a>
    <div class="column" v-if="!isPilotView">{{ pilot.base }}</div>
    <div class="column" v-if="!isPilotView">{{ pilot.rank | rank }}</div>
    <div class="column" v-if="!isPilotView">{{ pilot.seniority_number }}</div>
    <div class="column" v-if="!isPilotView">{{ pilot.employee_number }}</div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .scheduling-pilot-item {
    .column:first-child {
      padding-right: 0;
    }

    &__full-name {
      display: flex;
      justify-content: space-between;
    }

    &__legal-mark {
      &_legal { color: darken($--color-success, 10%) !important; }
      &_illegal { color: darken($--color-danger, 5%) !important; }
    }
  }
</style>
