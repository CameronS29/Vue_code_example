<script>
  import { mapGetters } from 'vuex';
  import TotalsProgress from './Progress.vue';
  import MonthlyPdf from './MonthlyPdf.vue';

  export default {
    name: 'Totals',

    props: {
      columns: {
        type: Boolean,
        default: false,
      },

      showApprove: {
        type: Boolean,
        default: false,
      },
    },

    components: {
      TotalsProgress,
      MonthlyPdf,
    },

    computed: mapGetters('fdt/legality', ['totals']),

    methods: {
      getTotals(field) {
        return Math.round(this.totals[field] || 0);
      },
    },
  };
</script>

<template>
  <div class="fdt-calendar__totals" :class="{ 'fdt-calendar__totals_columns': columns }">
    <totals-progress label="Year" postfix="hours" :value="getTotals('year_flown')" :max="1200"/>
    <totals-progress label="Month" postfix="hours" :value="getTotals('month_flown')" :max="120"/>
    <totals-progress label="Quarter" postfix="hours" :value="getTotals('quarter_flown')" :max="500"/>
    <monthly-pdf v-if="showApprove" />
  </div>
</template>

<style lang="scss" scoped>
  @import '../../../../../scss/bs-variables';

  .fdt-calendar__totals {
    display: flex;
    align-items: flex-end;

    .fdt-totals-progress {
      flex: 1 1;
    }

    .fdt-monthly-pdf {
      flex: 1 1;
    }

    @media screen and (max-width: $screen-xs-max) {
      flex-flow: column;
    }

    &_columns {
      flex-flow: column;
    }
  }
</style>
