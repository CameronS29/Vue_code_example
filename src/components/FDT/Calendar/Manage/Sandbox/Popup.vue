<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import isValid from 'date-fns/isValid';
  import BottomPopper from 'Common/BottomPopper.vue';
  import { FlightTypes } from 'store/modules/fdt/consts';
  import { vuexProperty } from 'utils/helpers';

  import manageMixin, { gmTime } from '../Common/manageMixin';
  import DutyList from '../Common/DutyList.vue';
  import FlightModal from './FlightModal.vue';
  import DutyModal from './DutyModal.vue';

  const prop = vuexProperty({ attr: 'importFilters', mutation: 'setImportFilters' });

  export default {
    name: 'SandboxManagePopup',
    mixins: [manageMixin],

    components: {
      BottomPopper,
      DutyList,
      FlightModal,
      DutyModal,
    },

    computed: {
      ...mapGetters('fdt/sandbox', ['isLoading']),
      ...mapState('fdt/sandbox', ['importFilters', 'flights', 'duties']),

      dateFrom: prop('date_from', gmTime),
      dateTo: prop('date_to', gmTime),

      dateRange: {
        get() {
          return [this.dateFrom, this.dateTo];
        },
        set(val) {
          if (val === null) {
            this.setImportFilters({
              date_from: null,
              date_to: null,
            });
          } else {
            const [dateFrom, dateTo] = val;
            this.dateFrom = dateFrom;
            this.dateTo = dateTo;
          }
        },
      },

      disabledImportButton() {
        return !(isValid(this.dateFrom) && isValid(this.dateTo));
      },
    },

    methods: {
      ...mapActions('fdt/sandbox', [
        'getFlights', 'getDuties',
        'deleteFlight', 'deleteDuty',
        'importActual',
      ]),

      ...mapMutations('fdt/sandbox', [
        'setEditableFlight',
        'setEditableDuty',
        'setImportFilters',
      ]),

      async updateDuties() {
        if (!this.showDutyForm) {
          return null;
        }

        const { pilot } = this;
        return Promise.all([
          this.getFlights({ pilot }),
          this.getDuties({ pilot }),
        ]);
      },

      async handleAddNewFlight() {
        const { pilot } = this;
        this.setEditableFlight({
          pilot,
          type: FlightTypes.Scheduled,
          datetime_on: new Date().toISOString(),
          datetime_off: new Date().toISOString(),
          origin: null,
          destination: null,
          flight_number: '001',
          single_pilot: true,
        });
      },

      async handleAddNewDuty() {
        const { pilot } = this;
        this.setEditableDuty({
          pilot,
          type: null,
          datetime_on: new Date().toISOString(),
          datetime_off: new Date().toISOString(),
          base: null,
        });
      },
    },
  };
</script>

<template>
  <bottom-popper :show="showDutyForm"
                 @close="handleCloseDutyForm"
                 title="Manage Flights & Duties"
                 header-height="50px">
    <flight-modal />
    <duty-modal />

    <div class="fdt-sandbox-manage__duty-types" v-loading="isLoading">
      <duty-list :data="flights" title="Flights" editable @add="handleAddNewFlight">
        <template slot="item" slot-scope="flight">
          <el-tag size="small" :type="flightTagType(flight)">{{ flightTagName(flight) }}</el-tag>
          <div class="fdt-duty-list__duty-times">
            &nbsp;{{ flight.datetime_on | format }}Z &rarr; {{ flight.datetime_off | format }}Z&nbsp;
          </div>
          <el-button size="mini"
                     class="fdt-duty-list__duty-edit-button"
                     icon="el-icon-edit"
                     @click="setEditableFlight(flight)" />
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteFlight(flight.id)" />
        </template>
      </duty-list>

      <duty-list :data="duties" title="Duties" editable @add="handleAddNewDuty">
        <template slot="item" slot-scope="duty">
          <el-tag size="small" :type="dutyTagType(duty)">{{ dutyTagName(duty) }}</el-tag>
          <div class="fdt-duty-list__duty-times">
            &nbsp;{{ duty.datetime_on | format }}Z &rarr; {{ duty.datetime_off | format }}Z&nbsp;
          </div>
          <el-button size="mini"
                     class="fdt-duty-list__duty-edit-button"
                     icon="el-icon-edit"
                     @click="setEditableDuty(duty)" />
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteDuty(duty.id)" />
        </template>
      </duty-list>

      <duty-list title="Import Actual Data">
        <div class="fdt-sandbox-modal__fields">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="To"
            size="small"
            start-placeholder="Start date"
            end-placeholder="End date"
          />
        </div>

        <div class="fdt-sandbox-modal__buttons">
          <el-button @click="importActual"
                     :disabled="disabledImportButton"
                     class="fdt-sandbox-modal__save"
                     type="primary"
                     size="small"
                     icon="el-icon-download">
            Import Actual Flights & Duties
          </el-button>
        </div>
      </duty-list>
    </div>
  </bottom-popper>
</template>

<style lang="scss">
  .fdt-sandbox-manage {
    &__duty-types {
      display: flex;
      min-height: 300px;
    }
  }
</style>
