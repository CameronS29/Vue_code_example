<script>
  import { mapGetters, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import SortableTable from 'Common/SortableTable';
  import ButtonEl from 'Common/Button.vue';
  import FlightPopover from '../../Common/FlightPopover.vue';

  import { tableNamespaceByTypeId } from '../../../../store/modules/scheduling/templates/reserve';

  export default {
    created() {
      this.getAllAvailableAirports();
    },

    props: {
      searchPortal: {
        type: [String, Boolean],
        default: false,
      },

      activeGroupId: {
        type: Number,
        default: null,
      },

      type: Number,
    },

    components: {
      SortableTable,
      ButtonEl,
      FlightPopover,
    },

    computed: {
      ...mapGetters('airports', [
        'byId',
      ]),

      tableNamespace() {
        return tableNamespaceByTypeId(this.type);
      },

      filters() {
        return {
          shift_type: this.type,
        };
      },
    },

    methods: {
      ...mapActions('airports', [
        'getAllAvailableAirports',
      ]),

      handleEditReserveClick(row) {
        this.$emit('edit-reserve-click', row);
      },

      handleDeleteReserveClick(row) {
        this.$emit('delete-reserve-click', row);
      },

      activeRowClass({ row }) {
        if (row.id === this.activeGroupId) {
          return 'reserve-templates-table__active-row';
        }
        return '';
      },

      formatTime(row) {
        const convert = time => DateTime.fromISO(time).toFormat('HH:mm');

        return `${convert(row.duty_on)} → ${convert(row.duty_off)}`;
      },

      getIata(row) {
        const airport = this.byId(row.base);

        return airport ? airport.iata : null;
      },
    },
  };
</script>

<template>
  <sortable-table
    :namespace="tableNamespace"
    :is-bordered="false"
    :filters="filters"
    :search-portal="searchPortal"
    :row-class-name="activeRowClass"
    :query-prefix="`pr-search-${type}-`"
    searchable="name"
  >
    <el-table-column prop="shortcut" width="85" label="Name" />

    <el-table-column prop="flights" label="On → Off">
      <template slot-scope="scope">
        {{ formatTime(scope.row) }}
        <span class="reserve-templates-table__next-day-notify"
              v-if="scope.row.next_day_off">+1 day</span>
      </template>
    </el-table-column>

    <el-table-column label="Base">
      <template slot-scope="scope">
        <strong>{{ getIata(scope.row) }}</strong>
      </template>
    </el-table-column>

    <el-table-column width="98">
      <template slot-scope="scope">
        <button-el
          title="Edit"
          @click="handleEditReserveClick(scope.row)"
          icon="pencil-square-o"
          size="sm"
        />
        <button-el
          type="danger"
          title="Delete"
          @click="handleDeleteReserveClick(scope.row)"
          icon="trash"
          size="sm"
        />
      </template>
    </el-table-column>
  </sortable-table>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .reserve-templates-table {
    &__next-day-notify {
      color: $red;
      margin-left: 5px;
    }
    &__active-row {
      background: transparentize($navy, 0.92);
    }
  }
</style>
