<script>
  import { mapGetters, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { sum, map, debounce, find } from 'lodash';

  import { TableColumn } from 'element-ui';
  import RouteTable from '../RouteTable.vue';

  import { timeZones } from '../../utils';
  import { queryParam } from '../../../../utils/routers';

  const dateFormat = 'MM/dd/yyyy';

  export default {
    name: 'GenericCommunity',

    /**
     * @property {number} lookbehind: Number of days to look behind.
     * @property {string} summary: Header title.
     */
    props: {
      dateFrom: DateTime,
      dateTo: DateTime,
      timeZone: String,
      title: String,
    },

    components: {
      RouteTable,
      TableColumn,
    },

    created() {
      this.fetchReport = debounce(this.fetchReport, 100);
      this.fetchReport();
    },

    computed: {
      ...mapGetters('reports/onTime', [
        'communitiesReport',
        'communitiesTotals',
        'isPending',
        'airports',
      ]),

      subtype: queryParam({
        param: 'subtype',
        defaultValue: 'community',
      }),

      label() {
        return {
          community: 'Community',
          departure: 'Departure',
        }[this.subtype];
      },

      flightLogFilters() {
        return {
          date_from: this.dateFrom.toISO(),
          date_to: this.dateTo.toISO(),
        };
      },

      totalStats() {
        const { communitiesTotals: totals } = this;
        if (totals.length === 0) {
          return null;
        }

        const entryCount = Math.max(totals.length, 1);

        return {
          performance: sum(map(totals, 'performance')) / entryCount,
          total_count: sum(map(totals, 'total_count')),
          on_time_count: sum(map(totals, 'on_time_count')),
          flown_count: sum(map(totals, 'flown_count')),
          delay_count: sum(map(totals, 'delay_count')),
          canceled_count: sum(map(totals, 'canceled_count')),
          avg_delay: sum(map(totals, 'avg_delay')) / entryCount,
          total_delay: sum(map(totals, 'total_delay')),
        };
      },

      tzList() {
        return timeZones;
      },

      displayDateRange() {
        let subject = `${this.dateFrom.toFormat(dateFormat)}`;
        if (this.dateTo.diff(this.dateFrom).as('days') > 1) {
          subject = `${subject} - ${this.dateTo.minus({ days: 1 }).toFormat(dateFormat)}`;
        }
        return subject;
      },
    },

    methods: {
      ...mapActions('reports/onTime', [
        'getCommunitiesReport',
      ]),

      fetchReport: debounce(function () {
        return this.getCommunitiesReport({
          date_from: this.dateFrom.toISO(),
          date_to: this.dateTo.toISO(),
          subtype: this.subtype,
        });
      }, 100),

      communityName(iata) {
        const airport = find(this.airports, ['iata', iata]);
        return (airport !== undefined
          ? `${airport.name} (${iata})`
          : iata);
      },

      updateTz(e) {
        this.$emit('tz-change', e.target.value);
      },
    },

    watch: {
      timeZone: 'fetchReport',
      dateFrom: 'fetchReport',
      dateTo: 'fetchReport',
    },
  };
</script>

<template>
  <div>
    <router-view :filters="flightLogFilters" />

    <div class="on-time-community__heading">
      <h3 class="on-time-community__title">
        Summary: {{ title }}
        ({{ displayDateRange }}, in
        <select class="form-control on-time-community__tz-select" @change="updateTz" :value="timeZone">
          <option v-for="tz in tzList" :key="tz.name" :value="tz.name">
            {{ tz.name }}
          </option>
        </select>
        )
      </h3>
      <div>
        <slot name="head-after"/>
      </div>
      <div class="on-time-community__subtype">
        Report type:
        <el-switch
          v-model="subtype"
          inactive-text="Community"
          active-text="Departure"
          inactive-value="community"
          active-value="departure"
        />
      </div>
    </div>
    <div v-loading="isPending">
      <route-table :data="communitiesTotals" :total="totalStats">
        <table-column :label="label" fixed="left" width="120">
          <template slot-scope="props">
            <a :href="`#${props.row.title}`">{{ props.row.title }}</a>
          </template>
        </table-column>
      </route-table>

      <div v-for="entry in communitiesReport"
           :key="entry.title"
           :id="entry.title"
           class="on-time-community__community">
        <h3 class="on-time-community__subtitle">{{ communityName(entry.title) }}:</h3>
        <route-table :data="entry.data" :origin="entry.title" :total="entry.totals" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import "../../../../../scss/bs-variables";

  .on-time-community {
    &__community {
      margin-top: 20px;
    }

    &__tz-select {
      font-weight: 400;
      display: inline-block;
      width: auto;
    }

    &__title {
      color: black;
      font-weight: bold;
      margin: 0 auto 0 0;
      flex: 0 0 auto;
    }

    &__subtitle {
      color: black;
      font-weight: bold;
      margin-bottom: 7px;
    }

    &__subtype {
      flex: 0 0 200px;
      margin-left: 10px;
    }

    &__heading {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }

    @media screen and (max-width: $screen-md-max) {
      &__heading {
        flex-flow: column;
        align-items: normal;
      }

      &__subtype {
        flex: auto;
        margin: 10px 0;
      }

      &__title {
        margin-right: 0;
      }
    }
  }
</style>
