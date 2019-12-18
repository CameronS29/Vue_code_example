<script>
  import { mapGetters, mapActions } from 'vuex';
  import { map, filter, fromPairs } from 'lodash';

  import qs from 'query-string';
  import moment from 'moment';

  import ButtonEl from 'Common/Button.vue';
  import Icon from 'Common/Icon.vue';

  import DatePicker from '../../../fields/Datepicker.vue';
  import Selectize from '../../../fields/Selectize.vue';
  import RouteTable from '../RouteTable.vue';

  import { queryParam } from '../../../../utils/routers';

  const filtersMap = {
    date_from: 'dateFrom',
    date_to: 'dateTo',
    manifest_op: 'manifestOpType',
    aircraft_type: 'aircraftType',
    flight_number: 'flightNumber',
    tail_number: 'tailNumber',
    pic: 'pic',
    sic: 'sic',
    operating_under: 'opType',
    origin: 'origin',
    destination: 'destination',
    delay_type: 'delayType',
  };

  export default {
    name: 'Plain',

    components: {
      Icon,
      ButtonEl,
      DatePicker,
      Selectize,
      RouteTable,
    },

    created() {
      this.getReport();
    },

    computed: {
      ...mapGetters('reports/onTime', [
        'totalStats',
        'routeStats',

        'pilots',
        'operations',
        'operatingUnder',
        'delays',
        'aircrafts',
        'aircraftTypes',
        'airports',

        'isPending',
      ]),

      dateFrom: queryParam({
        param: 'date_from',
        defaultValue: moment().subtract(1, 'month').format('MM/DD/YYYY'),
      }),

      dateTo: queryParam({
        param: 'date_to',
        defaultValue: moment().format('MM/DD/YYYY'),
      }),

      manifestOpType: queryParam({ param: 'manifest_op' }),
      aircraftType: queryParam({ param: 'aircraft_type' }),
      flightNumber: queryParam({ param: 'flight_no' }),
      tailNumber: queryParam({ param: 'tail_no' }),
      pic: queryParam({ param: 'pic' }),
      sic: queryParam({ param: 'sic' }),
      opType: queryParam({ param: 'operating_under' }),
      origin: queryParam({ param: 'origin' }),
      destination: queryParam({ param: 'destination' }),
      delayType: queryParam({ param: 'delay' }),

      csvReportLink() {
        return `/reports/api/ontime/?${qs.stringify({ ...this.filters, format: 'csv' })}`;
      },

      filters() {
        const filters = map(filtersMap, (field, name) => ([name, this[field]]));
        return fromPairs(filter(filters, ([, value]) => (value)));
      },
    },

    methods: {
      ...mapActions('reports/onTime', [
        'fetchReport',
        'resetReport',
        'getFilters',
      ]),

      getReport() {
        return this.fetchReport(this.filters);
      },

      clearFilters() {
        this.dateFrom = moment().subtract(1, 'month').format('MM/DD/YYYY');
        this.dateTo = moment().format('MM/DD/YYYY');

        this.manifestOpType = '';
        this.aircraftType = '';
        this.flightNumber = '';
        this.tailNumber = '';
        this.pic = '';
        this.sic = '';
        this.opType = '';
        this.origin = '';
        this.destination = '';
        this.delayType = '';

        this.getReport();
      },
    },

    filters: {
      pilot(pilots, pilotType) {
        return filter(pilots, pilotType);
      },
    },
  };
</script>

<template>
  <div class="on-time-report__container">
    <router-view :filters="filters" />
    <route-table class="on-time-report__table" :data="routeStats" :total="totalStats" />

    <div v-loading="isPending" class="on-time-report__filters-splash">
      <div class="on-time-report__filters">
        <date-picker v-model="dateFrom" label="Date From" />
        <date-picker v-model="dateTo" label="Date To" />

        <div class="on-time-report__filter-item">
          <label class="control-label">Manifest Operations Type</label>
          <select class="form-control" v-model="manifestOpType">
            <option value="">-- Select Operation Type --</option>
            <option v-for="op in operations" :key="op.id" :value="op.id">
              {{ op.name }}
            </option>
          </select>
        </div>

        <div class="on-time-report__filter-item">
          <selectize :items="aircraftTypes" v-model="aircraftType" field="name" label="Aircraft Type" />
        </div>

        <div class="on-time-report__filter-item">
          <label class="control-label">Flight Number</label>
          <input class="form-control" placeholder="Enter Flight Number" v-model="flightNumber" type="number" min="0" />
        </div>

        <div class="on-time-report__filter-item">
          <selectize :items="pilots | pilot('is_pic')" field="name" v-model="pic" label="PIC" full-label="Select Pilot" />
        </div>

        <div class="on-time-report__filter-item">
          <selectize :items="pilots | pilot('is_pic')" field="name" v-model="sic" label="SIC" full-label="Select Pilot" />
        </div>

        <div class="on-time-report__filter-item">
          <label class="control-label">Type of Operation</label>
          <select class="form-control" v-model="opType">
            <option value="">-- Select Operation Type --</option>
            <option v-for="op in operatingUnder" :key="op.id" :value="op.id">
              {{ op.operation }}
            </option>
          </select>
        </div>

        <div class="on-time-report__filter-item">
          <selectize :items="airports" id-field="iata" field="iata"
                     v-model="origin" label="Origin" full-label="Select Airport" />
        </div>

        <div class="on-time-report__filter-item">
          <selectize :items="airports" id-field="iata" field="iata"
                     v-model="destination" label="Destination" full-label="Select Airport" />
        </div>

        <div class="on-time-report__filter-item">
          <label class="control-label">Type of Delay</label>
          <select class="form-control" v-model="delayType">
            <option value="">-- Pick Delay Type --</option>
            <option v-for="delay in delays" :key="delay.id" :value="delay.id">
              {{ delay.name }}
            </option>
          </select>
        </div>

        <div class="on-time-report__filter-item on-time-report__filter-buttons">
          <button-el label="Clear" @click="clearFilters" icon="times" type="default" />
          <button-el label="Apply Filters" @click="getReport" icon="filter" type="primary" />
        </div>

        <div class="on-time-report__filter-item on-time-report__filter-buttons">
          <a class="btn btn-success" :href="csvReportLink" target="_blank">
            <icon glyph="file-excel-o" />
            &nbsp;Generate CSV Report
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .on-time-report {
    &__container {
      display: flex;
      justify-content: stretch;
      align-items: flex-start;
    }

    &__table {
      flex: 1 1 100%;
    }

    &__filters-splash {
      display: flex;
      flex: 1 1 30%;
      margin-left: 15px;
      max-width: 100%;
    }

    &__filters {
      display: flex;
      justify-content: stretch;
      flex-direction: column;
    }

    &__filters-splash,
    &__table {
      order: 1;
    }

    &__filter-buttons {
      align-self: flex-end;
    }

    &__cell {
      word-break: normal;
    }

    &__filter-item {
      margin-bottom: 10px;
      width: 100%;
    }

    @media screen and (max-width: $screen-sm-max) {
      &__container {
        flex-direction: column;
      }

      &__filter-buttons {
        align-self: flex-start;
        margin-top: 24px;
      }

      &__filters-splash {
        order: 0;
        margin-left: 0;
      }
    }

    @media screen and (max-width: $screen-xs-max) {
      &__generate-button {
        align-self: stretch;
      }
      &__filters {
        flex-direction: column;
        & > * { margin-left: 0; }
      }
    }
  }
</style>

