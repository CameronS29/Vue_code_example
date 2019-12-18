<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';
  import SortableTable from 'Common/SortableTable';
  import ButtonEl from 'Common/Button.vue';
  import FlightPopover from '../../Common/FlightPopover.vue';
  import { reserveRecordsMixin } from '../mixins';

  import { tableNamespaceByTypeId } from 'store/modules/scheduling/shifts/reserve';

  export default {
    created() {
      this.getAllAvailableAirports();
    },

    mixins: [reserveRecordsMixin],

    props: {
      searchPortal: {
        type: [String, Boolean],
        default: false,
      },

      selectedShiftNames: {
        /**
         * Array of string. Like ['P11', 'A12']
         * Useful for exclude already applied pairings
         */
        type: Array,
        default: () => ([]),
      },

      activeGroupId: {
        type: Number,
        default: null,
      },

      isInAdditionMode: {
        type: Boolean,
        default: false,
      },

      type: Number,
      filters: Object,
    },

    components: {
      SortableTable,
      ButtonEl,
      FlightPopover,
    },

    computed: {
      ...mapGetters('airports', [
        'byId'
      ]),

      tableNamespace() {
        return tableNamespaceByTypeId(this.type);
      },

      typedFilters() {
        return { 'shift_type': this.type, ...this.filters };
      }
    },

    methods: {
      ...mapActions('airports', [
        'getAllAvailableAirports'
      ]),

      handleAddReserveClick(row) {
        this.$emit('add-reserve-click', row);
      },

      handleEditReserveClick(row) {
        this.$emit('edit-reserve-click', row);
      },

      handleDeleteReserveClick(row) {
        this.$emit('delete-reserve-click', row);
      },

      activeRowClass({ row }) {
        if (row.id === this.activeGroupId) {
          return 'reserve-shifts-table__active-row';
        }
      },

      isShiftAlreadyApplied(name) {
        return this.selectedShiftNames.indexOf(name) !== -1;
      },
    },
  };
</script>

<template>
  <sortable-table
    :namespace="tableNamespace"
    :isBordered="false"
    :searchPortal="searchPortal"
    :row-class-name="activeRowClass"
    :filters="typedFilters"
    :queryPrefix="`pr-search-${type}-`"
    :pageSize="10"
    searchable="name"
  >
    <el-table-column prop="shortcut" width="70" label="Name" />

    <el-table-column prop="flights" label="Off → On">
      <template slot-scope="scope">{{ formatTime(scope.row, !isInAdditionMode) }}</template>
    </el-table-column>

    <el-table-column label="Base" width="70">
      <template slot-scope="scope">
        <strong>{{ getIata(scope.row) }}</strong>
      </template>
    </el-table-column>

    <el-table-column :width="isInAdditionMode ? 58 : 98">
      <template slot-scope="scope">
        <button-el
          size="sm"
          title="Add"
          icon="plus"
          v-if="isInAdditionMode && !isShiftAlreadyApplied(scope.row.shortcut)"
          @click="handleAddReserveClick(scope.row)"
        />
        <div v-if="!isInAdditionMode">
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
        </div>
      </template>
    </el-table-column>
  </sortable-table>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .reserve-shifts-table {
    &__active-row {
      background: transparentize($navy, 0.92);
    }
  }
</style>



