<script>
  import _ from 'lodash';
  import {mapState, mapActions, mapGetters} from 'vuex';
  import {TableColumn, Tooltip} from 'element-ui';

  import Block from 'Common/Block.vue';
  import Icon from 'Common/Icon.vue';
  import SortableTable, {tableMixin} from 'Common/SortableTable';

  import stateApi from '../../../api/state';
  import createTableStore from '../../../store/factory/table';
  import history from '../../../store/modules/aircraft/history';
  import {queryParam} from '../../../utils/routers';

  export default {
    name: 'StateHistoryTable',

    mixins: [tableMixin('tables/state', stateApi, history)],

    props: {
      showPagination: {
        type: Boolean,
        default: true,
      },
      isReadOnly: {
        type: Boolean,
        default: false,
      },
      aircraft: [Number, String],
      date_0: String,
      date_1: String,
      type: String,
    },

    components: {
      Block,
      Icon,
      SortableTable,
      ElTableColumn: TableColumn,
      Tooltip,
    },

    methods: {

      rowClass({row}) {
        if (row.state && row.state.correction) {
          return "row_correction";
        }
        if (row.state && row.state.log) {
          return "row_log";
        }
        if (row.swap) {
          return "row_swap";
        }
      },

      requestCSV() {
        return stateApi.requestCSV(this.filters, this.ordering);
      },

      formatTime(date) {
        return moment.utc(date).format('Y-MM-DD HH:mm');
      },

      formatDate(date) {
        return moment.utc(date).format('Y-MM-DD');
      },

      historySpan({row, column, rowIndex, columnIndex}) {
        if (!!row.swap && (columnIndex === 1)) {
          return [1, 3];
        }
        if (!!row.swap && (columnIndex < 4 && columnIndex > 1)) {
          return [1, 0]
        }
        if (!!row.swap && (columnIndex === 4)) {
          return [1, 5];
        }
        if (!!row.swap && (columnIndex > 4) && (columnIndex < 9)) {
          return [1, 0];
        }
        return [1, 1];
      },

      getProp: _.get,
    },
  };
</script>

<template>
  <sortable-table namespace="tables/state"
                  table-size="mini"
                  :filters="{ aircraft, date_0, date_1, type }"
                  :show-pagination="showPagination"
                  :row-class-name="rowClass"
                  class="state-history-table"
                  :span-method="historySpan"
                  :key="isReadOnly"
  >
    <el-table-column prop="state.id" fixed min-width="180" label="Manifest #" sortable="id" align="center">
      <template slot-scope="scope">
        <span v-if="scope.row.state">
          <template v-if="scope.row.state.log">
            <strong v-if="isReadOnly" class="state-history-table__read-only-number">
              {{ scope.row.state.tail_number }} # {{ scope.row.state.log.manifest.number }}
            </strong>
            <a v-else :href="scope.row.state.log.absolute_url" class="el-tag el-tag--info">
              {{ scope.row.state.tail_number }} # {{ scope.row.state.log.manifest.number }}
            </a>
            <a :href="scope.row.state.log.manifest.pdf_url" target="_blank" class="el-tag el-tag--info">
              <i class="fa fa-file-pdf-o" aria-hidden="true" />
            </a>
          </template>
          <strong v-else-if="scope.row.state.correction && isReadOnly">Adj#{{ scope.row.state.correction.id }}</strong>
          <router-link
            :to="{ name: 'aircraft_adjust_edit', params: {id: scope.row.state.correction.id} }"
            v-else-if="scope.row.state.correction && !isReadOnly" class="el-tag el-tag--primary"
          >
            Adj#{{ scope.row.state.correction.id }}
          </router-link>
        </span>
        <span v-else-if="scope.row.swap">
          <strong v-if="isReadOnly">
            Swap
          </strong>
          <router-link
            v-else
            :to="{ name: 'engine_swap_edit', params: {id: scope.row.swap.id} }" class="el-tag el-tag--primary"
          >
            Swap
          </router-link>
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="state.tat" sortable="tat" label="AFTT" width="90">
      <template slot-scope="scope">
        <span v-if="scope.row.state">
          {{ scope.row.state.tat }}
        </span>
        <span v-if="scope.row.swap">
          {{ scope.row.swap.engine_data.serial_number }} as Engine # {{ scope.row.swap.position }}
          ({{ scope.row.swap.time_at_install }} h, {{ parseInt(scope.row.swap.cycles_at_install) }} cycles)
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="state.landings" sortable="landings" label="Landings" width="120" />
    <el-table-column
      sortable="log__initial_hobbs"
      label="Initial HOBBS"
      width="150"
    >
      <template slot-scope="props">
        <div>
          <div :class="{ 'state-history-table__miscontinued': !props.row.state.hobbs_continuity }"
               v-if="props.row.state">
            {{ getProp(props.row.state, 'log.initial_hobbs') }}
            <tooltip
              v-if="!props.row.state.hobbs_continuity"
              effect="dark"
              content="Initial HOBBS of this log don't match with Finals of previous one"
              placement="top"
            >
              <icon class="state-history-table__help" glyph="question-circle" />
            </tooltip>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="state.hobbs" sortable="hobbs" label="Final HOBBS" width="150">
      <template slot-scope="scope">
        <span v-if="scope.row.state">
          {{ scope.row.state.hobbs }}
        </span>
        <span v-if="scope.row.swap">
          <strong>Comments:</strong> {{ scope.row.swap.comments }}
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="state.hobbs" sortable="hobbs" label="AFTT/Hobbs Δ" width="150">
      <template slot-scope="scope">
        <span v-if="scope.row.state">
          {{ Math.abs(Math.round((scope.row.state.tat - scope.row.state.hobbs)*100)/100) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      prop="state.log.oil_add_amount"
      sortable="log__oil_add_amount"
      label="Oil added"
      width="120"
    />
    <el-table-column label="Engine 1">
      <el-table-column
        prop="state.engine_1_name"
        label="Serial"
        sortable="engine_1__serial_number"
        width="120"
      />

      <el-table-column
        prop="state.engine_1_time"
        label="Hrs"
        sortable="engine_1_time"
        width="90"
      />

      <el-table-column
        prop="state.engine_1_cycles"
        sortable="engine_1_cycles"
        label="Cycles"
        width="110"
      />
    </el-table-column>

    <el-table-column label="Engine 2">
      <el-table-column
        prop="state.engine_2_name"
        sortable="engine_2__serial_number"
        label="Serial"
        width="120"
      />

      <el-table-column
        prop="state.engine_2_time"
        sortable="engine_2_time"
        label="Hrs"
        width="90"
      />

      <el-table-column
        prop="state.engine_2_cycles"
        sortable="engine_2_cycles"
        label="Cycles"
        width="110"
      />
    </el-table-column>


    <el-table-column
      prop="state.log.flight.origin"
      sortable="log__flight__origin"
      label="Origin"
      width="120"
    >
      <template slot-scope="props">
        <div :class="{ 'state-history-table__miscontinued': !props.row.state.location_continuity }"
             v-if="props.row.state">
          <span :style="{'text-decoration': getProp(props.row.state, 'log.flight.flight.actual_origin')  ? 'line-through' : 'none'}"
                v-if="!getProp(props.row.state, 'log.flight.actual_origin')
                || getProp(props.row.state, 'log.flight.flight.actual_origin') !=  getProp(props.row.state, 'log.flight.flight.origin')">
            {{ getProp(props.row.state, 'log.flight.origin')  }}
          </span>
          <span v-if="getProp(props.row.state, 'log.flight.actual_origin') ">
            {{ getProp(props.row.state, 'log.flight.actual_origin')  }}
          </span>
          <tooltip
            v-if="!props.row.state.location_continuity"
            effect="dark"
            content="Current Origin don't match with previous Destination"
            placement="top"
          >
            <icon class="state-history-table__help" glyph="question-circle" />
          </tooltip>
        </div>
      </template>
    </el-table-column>

    <el-table-column
      prop="state.log.flight.destination"
      sortable="log__flight__destination"
      label="Destination"
      width="120"
    >
      <template slot-scope="props">
          <span :style="{'text-decoration': getProp(props.row.state, 'log.flight.flight.actual_destination')  ? 'line-through' : 'none'}"
                v-if="!getProp(props.row.state, 'log.flight.actual_destination')
                || getProp(props.row.state, 'log.flight.flight.actual_destination') !=  getProp(props.row.state, 'log.flight.flight.destination')">
            {{ getProp(props.row.state, 'log.flight.destination')  }}
          </span>
          <span v-if="getProp(props.row.state, 'log.flight.actual_destination') ">
            {{ getProp(props.row.state, 'log.flight.actual_destination')  }}
          </span>
      </template>
    </el-table-column>

    <el-table-column
      prop="state.tail_number"
      label="Aircraft"
      sortable="aircraft__registration"
      min-width="130"
    />

    <el-table-column
      prop="state.log.flight.flight_number"
      label="Flight #"
      sortable="log__flight__flight_number"
      min-width="140"
    />

    <el-table-column prop="state.correction.notes" label="Comments" min-width="200" />

    <el-table-column sortable="date" label="Date" fixed="right" width="140">
      <template slot-scope="scope">
        <span v-if="scope.row.state">{{ formatTime(scope.row.state.date) }}</span>
        <span v-if="scope.row.swap">{{ formatDate(scope.row.swap.date_of_install) }}</span>
      </template>
    </el-table-column>
  </sortable-table>
</template>

<style lang="scss" src="../../design/scss/layout.scss"></style>
<style lang="scss">
  @import "../../../../scss/bs-variables";

  .state-history-table {
    &__read-only-number {
      margin-right: 5px;
    }

    &__miscontinued {
      background: transparentize($red, 0.6);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 7px 19px;
      display: flex;
      align-items: center;
    }

    &__help {
      opacity: 0.4;
      margin-left: 5px;
      transition: opacity .2s;

      &:hover {
        opacity: 0.7;
      }
    }

    .el-tag {
      line-height: 24px;
      height: 24px;
    }

    .el-table  {
      .row_swap {
        background-color: #f0faff;
      }
      .row_correction {
        background: #e8fbff;
      }
    }
  }
</style>
