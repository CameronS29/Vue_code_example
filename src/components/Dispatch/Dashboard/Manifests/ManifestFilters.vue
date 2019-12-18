<script>
  import moment from 'moment';
  import { pickBy, debounce } from 'lodash';
  import { mapGetters, mapActions } from 'vuex';

  import { DatePicker, Button } from 'element-ui';
  import Selectize from '../../../fields/Selectize.vue';

  import { queryParam } from '../../../../utils/routers';
  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED,
  } from '../../../../store/modules/flightlog/consts';
  import optionsApi from '../../../../api/options';


  const dateFormat = 'MM/DD/Y';

  export default {
    props: {
      filters: {
        type: Object,
        required: true,
      },
      hideStatus: {
        type: Boolean,
        required: false,
        default: false,
      },
    },

    model: {
      prop: 'filters',
      event: 'filter',
    },

    components: {
      Selectize,
      DatePicker,
      ButtonEl: Button,
    },

    data() {
      return {
        operations: [],
      };
    },

    created() {
      this.updateFilters = debounce(this.updateFilters, 300);

      this.getAllOptions();
      this.getManifestOptions();
      this.getAvailablePilots();
      this.updateFilters();
    },

    computed: {
      ...mapGetters('wb', [
        'availableAircrafts',
        'availablePICPilots',
        'availableSICPilots',
      ]),

      tailNumber: queryParam({
        param: 'tail_number',
        defaultValue: 0,
        mapper: Number,
      }),
      dateFrom: queryParam({ param: 'date_from' }),
      dateTo: queryParam({ param: 'date_to' }),
      picId: queryParam({
        param: 'pic',
        defaultValue: 0,
        mapper: Number,
      }),
      sicId: queryParam({
        param: 'sic',
        defaultValue: 0,
        mapper: Number,
      }),
      status: queryParam({ param: 'status' }),
      typeOfOperation: queryParam({ param: 'op_type' }),

      dateRange: {
        get() {
          return !(this.dateFrom && this.dateTo) ? '' : [
            moment(this.dateFrom, dateFormat).toDate(),
            moment(this.dateTo, dateFormat).toDate(),
          ];
        },
        set(dateRange) {
          if (!dateRange || dateRange === undefined) {
            this.dateFrom = '';
            this.dateTo = '';
            return;
          }

          const [dateFrom, dateTo] = dateRange
            .map(date => moment(date))
            .map(date => (date.isValid() ? date.format(dateFormat) : ''));

          this.dateFrom = dateFrom;
          this.dateTo = dateTo;
        },
      },

      statusItems() {
        return [
          { type: '', name: 'All' },
          { type: STATUS_OPEN, name: 'Open' },
          { type: STATUS_PENDING_PIC, name: 'Pending PIC' },
          { type: STATUS_DISPATCH_PENDING, name: 'Dispatch Pending' },
          { type: STATUS_DISPATCH_RE_OPEN, name: 'Dispatch Re-Open' },
          { type: STATUS_COMPLETED, name: 'Completed' },
        ];
      },
    },

    methods: {
      ...mapActions('wb', [
        'getAllOptions',
        'getAvailablePilots',
      ]),

      getManifestOptions() {
        return optionsApi.getFlightManifestOptions()
          .then(({ operations }) => {
            this.operations = operations;
          });
      },

      updateFilters() {
        this.$emit('filter', pickBy({
          aircraft: this.tailNumber,
          pic: this.picId,
          sic: this.sicId,
          created_on_0: this.dateFrom,
          created_on_1: this.dateTo,
          op_type: this.typeOfOperation,
          status: this.status,
        }));
      },

      clearFilters() {
        this.tailNumber = '';
        this.dateRange = undefined;
        this.picId = 0;
        this.sicId = 0;
        this.status = '';
        this.typeOfOperation = '';
      },
    },

    watch: {
      tailNumber: 'updateFilters',
      dateFrom: 'updateFilters',
      dateTo: 'updateFilters',
      picId: 'updateFilters',
      sicId: 'updateFilters',
      status: 'updateFilters',
      typeOfOperation: 'updateFilters',
    },
  };
</script>

<template>
  <div>
    <div class="dispatch-dashboard__manifests-list__filters">
      <selectize
        class="manifests-list__filter-item"
        v-model="tailNumber"
        :items="availableAircrafts"
        field="registration"
        label="Tail Number"
        full-label="Select Aircraft"
      />

      <div class="manifests-list__filter-item">
        <label class="control-label">Date Range</label>
        <div>
          <date-picker
            v-model="dateRange"
            size="small"
            type="daterange"
            format="MM/dd/yyyy"
            placeholder="Pick date range"
          />
        </div>
      </div>

      <selectize
        class="manifests-list__filter-item"
        v-model="picId"
        :items="availablePICPilots"
        field="name"
        label="PIC"
        full-label="Select Pilot"
      />

      <selectize
        class="manifests-list__filter-item"
        v-model="sicId"
        :items="availableSICPilots"
        field="name"
        label="SIC"
        full-label="Select Pilot"
      />

      <div class="manifests-list__filter-item">
        <label class="control-label">Type of Operation</label>
        <select class="form-control" v-model="typeOfOperation">
          <option value="">All</option>
          <option v-for="op in operations" :key="op.id" :value="op.id">
            {{ op.name }}
          </option>
        </select>
      </div>

      <div v-if="!hideStatus" class="manifests-list__filter-item">
        <label class="control-label">Status of Manifest</label>
        <select class="form-control" v-model="status">
          <option v-for="item in statusItems" :key="item.type" :value="item.type">
            {{ item.name }}
          </option>
        </select>
      </div>

      <div class="manifests-list__filter-item"/>
      <div class="manifests-list__filter-item manifests-list__clear-button">
        <button-el @click="clearFilters" type="primary" icon="close">
          Clear Filters
        </button-el>
      </div>
    </div>
    <hr>
  </div>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .dispatch-dashboard__manifests-list__filters {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
  }

  .manifests-list {
    &__filter-item {
      flex: 1 1 25%;
      padding: 10px;

      @media screen and (max-width: $screen-sm-max) {
        flex: 1 1 33.3%;
      }

      @media screen and (max-width: $screen-xs-max) {
        flex: 1 1 100%;
      }

      .el-date-editor {
        width: 100% !important;

        .el-input__icon {
          color: #555;
        }

        .el-input__inner {
          height: 34px;
          border: 1px solid #ccc;
          color: #444;

          &::placeholder {
            color: #555;
          }
        }
      }
    }

    &__clear-button {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }
  }
</style>

