<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  import ItemModal from './ItemModal.vue';
  import CompleteModal from './CompleteModal.vue';
  import SortableTable, { tableMixin } from 'Common/SortableTable';
  import { TABLE_NAMESPACE, tableModule } from "store/modules/aircraft/discrepancy";
  import discrepancyAPI from 'api/dispatch/discrepancy';
  import { typeBasedSerializer } from 'Common/Filters/helpers';
  import { DateTime } from 'luxon';
  export const LUXON_DATE_FORMAT = 'MM/dd/yyyy';

  export default {
    components: {
      ItemModal,
      CompleteModal,
      SortableTable,
    },
    data() {
      return { TABLE_NAMESPACE};
    },
    mixins: [tableMixin(TABLE_NAMESPACE, discrepancyAPI, tableModule)],
    computed: {
      ...mapGetters('aircraft/discrepancy', ['discrepancies']),
      ...mapState('aircraft', ['aircraftTypes']),
      ...mapGetters('aircraft', ['aircraftTypeById']),
      ...mapState('aircraft/discrepancy/filters', ['filters']),

      tableFilters() {
        return typeBasedSerializer(this.filters);
      },
    },
    methods: {
      ...mapMutations('aircraft/discrepancy', ['setCurrentDiscrepancy', 'setCompleteDiscrepancy']),
      ...mapActions('aircraft/discrepancy', ['fetchDiscrepancies', 'deleteDiscrepancy']),
      ...mapActions('aircraft', ['getAircraftTypes']),

      aircraftType(item) {
        const aircraftType = this.aircraftTypeById(item.aircraft_type);
        return aircraftType ? aircraftType.name : undefined;
      },

      rowClass({ row }) {
        if (row.resolved) {
          return 'discrepancy__row_resolved';
        }

        if (row.due_date) {
          const dueDate = DateTime.fromFormat(row.due_date, LUXON_DATE_FORMAT, { zone: 'utc' });
          if (DateTime.utc() > dueDate) {
            return 'discrepancy__row_expired';
          } else if (DateTime.utc().plus({ days: 5 }) > dueDate) {
            return 'discrepancy__row_soon';
          }
        }
      },

      addItem() {
        this.setCurrentDiscrepancy({});
      },

      completeItem(item) {
        this.setCompleteDiscrepancy(item);
      },

      editItem(item) {
        this.setCurrentDiscrepancy(item);
      },

      async deleteItem(item) {
        await this.$confirm('This will permanently delete Discrepancy record. Continue?', 'Warning', {
          type: 'warning',
        });

        this.deleteDiscrepancy(item);
      },
    },
  };
</script>

<template>
  <div class="discrepancies">
    <portal to="header">
      <div class="discrepancies__header-items">
        <el-button type="primary" @click="addItem" round icon="el-icon-plus">Add new</el-button>
      </div>
    </portal>

    <sortable-table
      :page-size="100"
      :filters="tableFilters"
      searchable="search"
      search-portal="discrepancy-list-search"
      :namespace="TABLE_NAMESPACE"
      :row-class-name="rowClass"
      class="flight-picker-table"
      table-size="mini"
      :default-sort="{prop: 'date_recorded', order: 'descending'}"
    >
      <el-table-column
        width="180"
        fixed
      >
        <template slot-scope="props">
          <el-button-group class="discrepancies__controls">
            <el-button @click="completeItem(props.row)" size="mini" type="primary" icon="el-icon-check">Complete
            </el-button>

            <el-button @click="editItem(props.row)" size="mini" type="info">Edit</el-button>
            <el-button @click="deleteItem(props.row)" size="mini" type="danger">Delete</el-button>
          </el-button-group>
        </template>
      </el-table-column>

      <el-table-column
        prop="aircraft_info.registration"
        sortable="aircraft__registration"
        label="Tail number"
      />

      <el-table-column
        prop="aircraft_info.registration"
        sortable
        label="In FD"
      >
        <template slot-scope="props">
          <div>
            <span v-if="props.row.flightdoc_added">FD</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="flightdoc_added"
        sortable="flightdoc_added"
        label="Recorder"
      >
        <template slot-scope="props">
          {{ props.row.recorder_info | fullName }}
        </template>
      </el-table-column>

      <el-table-column
        prop="pilot_info.id"
        sortable="pilot__first_name"
        label="PIC"
      >
        <template slot-scope="props">
          {{ props.row.pilot_info | fullName }}
        </template>
      </el-table-column>

      <el-table-column
        prop="description"
        sortable="description"
        label="Description of discrepancy"
      />

      <el-table-column
        prop="corrective_action"
        sortable="corrective_action"
        label="Corrective action"
      />

      <el-table-column
        prop="ref_info.code"
        sortable="ref__code"
        label="Item lookup"
      />

      <el-table-column
        prop="date_recorded"
        sortable="date_recorded"
        label="Date recorded"
      >
        <template slot-scope="props">
          {{ props.row.date_recorded }}
        </template>
      </el-table-column>

      <el-table-column
        prop="verbose_category"
        sortable="ref__category"
        label="MEL Category"
      />

      <el-table-column
        prop="due_date"
        sortable="due_date"
        label="MEL restriction due date"
      >
        <template slot-scope="props">
          {{ props.row.deferrable ? props.row.due_date : 'GROUNDING' }}
        </template>
      </el-table-column>

      <el-table-column
        prop="released_by_info.id"
        sortable="released_by__first_name"
        label="Released by"
      >
        <template slot-scope="props">
          {{ props.row.released_by_info | fullName }}
        </template>
      </el-table-column>

      <el-table-column
        prop="resolution_date"
        sortable="resolution_date"
        label="Resolution date"
      >
        <template slot-scope="props">
          {{ props.row.resolution_date }}
        </template>
      </el-table-column>

      <el-table-column
        prop="control_number"
        sortable="control_number"
        label="Control number"
      />

      <el-table-column
        prop="notes"
        sortable="notes"
        label="Notes"
      />
    </sortable-table>

    <item-modal />
    <complete-modal />
  </div>
</template>


<style lang="scss">
  @import "../../../../scss/bs-variables";

  .discrepancies {
    &__header-items {
      display: flex;
      > *:not(:last-child) {
        margin-right: 20px;
      }
    }
    &__controls {
      display: flex;
      align-items: center;
      .el-button--mini {
        padding: 1px 3px;
        font-size: 11px;
        flex: 1 1 auto;
      }
    }

    tr.discrepancy__row {
      &_resolved {
        background-color: #E3F4E8;
        td {
          border-color: transparentize($brand-success, .85);
        }
      }
      &_expired {
        background-color: #FFE5E8;
        td {
          border-color: transparentize($red, .85);
        }
      }
      &_soon {
        background-color: #FFF3E6;
        td {
          border-color: transparentize($brand-warning, .85);
        }
      }
    }

    .el-table .cell {
      line-height: 20px;
    }
  }
</style>
