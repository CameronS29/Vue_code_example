<script>
  import { BlockTypes, FlightTypes } from 'store/modules/fdt/consts';
  import StatusItem from '../Common/StatusItem.vue';
  import ContainerView from '../Common/ContainerView.vue';

  export default {
    name: 'FlightLimitations',

    props: {
      block: {
        type: Object,
        default: () => ({}),
      },
    },

    components: {
      StatusItem,
      ContainerView,
    },

    methods: {
      getColor(legality) {
        if (legality === null) {
          return 'black';
        }
        return legality
          ? 'green'
          : 'red';
      },
    },

    computed: {
      isScheduled() {
        const { type, flight_type } = this.block;
        return type === BlockTypes.CompanyFlight && flight_type === FlightTypes.Scheduled;
      },
      isUnscheduled() {
        const { type, flight_type } = this.block;
        return type === BlockTypes.CompanyFlight && flight_type === FlightTypes.Unscheduled;
      },
    },
  };
</script>

<template>
  <container-view title="Flight Time Limitations">
    <table v-if="isScheduled" class="fdt-limitations__table">
      <thead>
        <tr>
          <th>34/7D</th>
          <th>120/M</th>
          <th>24/7D</th>
          <th>Other</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-if="isScheduled">
            <status-item :title="block.flown_last_7d" :status="getColor(block.rules.legal_265_a_3)" />
          </td>
          <td v-if="isScheduled">
            <status-item :title="block.month_flown" :status="getColor(block.rules.legal_265_a_2)" />
          </td>
          <td v-if="isScheduled">
            <status-item :title="block.maximum_past_week_rest" :status="getColor(block.rules.legal_265_d)" />
          </td>
          <td>
            <status-item :title="block.totals.year_flown"
                         caption="§ 135.265 (a.1)"
                         :status="getColor(block.rules.legal_265_a_1)" />

            <status-item v-if="block.single_pilot"
                         :title="block.totals.flown_last_24h"
                         caption="§ 135.265 (a.4)"
                         :status="getColor(block.rules.legal_265_a_4)" />

            <status-item v-if="block.rules.legal_265_a_5 !== null && !block.single_pilot"
                         :title="`${block.totals.flown_between_rests}`"
                         caption="§ 135.265 (a.5)"
                         :status="getColor(block.rules.legal_265_a_5)" />

            <status-item :title="`${block.totals.current_rest} (min ${block.totals.minimal_required_rest})`"
                         caption="§ 135.265 (b)"
                         :status="getColor(block.rules.legal_265_b)" />
          </td>
        </tr>
      </tbody>
    </table>
    <table v-else-if="isUnscheduled" class="fdt-limitations__table">
      <thead>
        <tr>
          <th>500/Q</th>
          <th>800/2Q</th>
          <th>1400/Y</th>
          <th>Other</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <status-item :title="block.totals.quarter_flown" :status="getColor(block.rules.legal_267_a_1)" />
          </td>
          <td>
            <status-item :title="block.totals.last_2_quarters_flown" :status="getColor(block.rules.legal_267_a_2)" />
          </td>
          <td>
            <status-item :title="block.totals.year_flown" :status="getColor(block.rules.legal_267_a_3)" />
          </td>

          <td>
            <status-item title="§ 135.267 (b.1)"
                         :status="getColor(block.rules.legal_267_b_1)"
                         v-if="block.single_pilot" />

            <status-item title="§ 135.267 (b.2)"
                         :status="getColor(block.rules.legal_267_b_2)"
                         v-else />
          </td>
        </tr>
      </tbody>
    </table>
  </container-view>
</template>

<style lang="scss" scoped>
  .fdt-limitations__table {
    td, th {
      padding-left: 10px;
      vertical-align: top;

      &:first-child {
        padding-left: 0;
      }
    }
  }
</style>
