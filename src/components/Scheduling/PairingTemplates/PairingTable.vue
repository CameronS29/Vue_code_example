<script>
  import { mapState, mapGetters } from 'vuex';
  import { DateTime } from 'luxon';
  import SortableTable from 'Common/SortableTable';
  import ButtonEl from 'Common/Button.vue';
  import FlightPopover from '../Common/FlightPopover';

  import { tableNamespace } from '../../../store/modules/scheduling/pairing-templates'
  import { LUXON_US_DATE_FORMAT } from '../../../store/modules/scheduling/consts';

  export default {
    props: {
      searchPortal: {
        type: [String, Boolean],
        default: false,
      },

      activeGroupId: {
        type: Number,
        default: null,
      },

      filters: Object,
    },

    components: {
      SortableTable,
      ButtonEl,
      FlightPopover,
    },

    computed: {
      ...mapState('scheduling/pairingTemplates', ['collisions']),
      ...mapGetters('scheduling/pairingTemplates', ['intersectedShellNames']),

      tableNamespace() {
        return tableNamespace;
      },
    },

    methods: {
      handleEditPairingClick(id) {
        this.$emit('edit-pairing-group-click', id);
      },

      formattedLastUpdateDate(date) {
        return DateTime.fromISO(date).toLocaleString(LUXON_US_DATE_FORMAT);
      },

      activeRowClass({ row }) {
        if (row.id === this.activeGroupId) {
          return 'pairing-templates__active-row';
        }
        return undefined;
      },

      isCollided(row) {
        return row.name in this.intersectedShellNames;
      },
    },
  };
</script>

<template>
  <sortable-table
    :namespace="tableNamespace"
    :filters="filters"
    :is-bordered="false"
    :search-portal="searchPortal"
    :row-class-name="activeRowClass"
    query-prefix="ptg-"
    searchable="name"
    class="pairing-list"
  >
    <el-table-column width="70" label="Name">
      <template slot-scope="scope">
        <el-badge
          title="Collision detected"
          class="pairing-list__invalid-badge"
          is-dot
          :hidden="!isCollided(scope.row)">
          {{scope.row.name}}
        </el-badge>
      </template>
    </el-table-column>

    <el-table-column prop="flights" label="Last Flights">
      <template slot-scope="scope">
        <div v-if="scope.row.last_shell" class="flights-table__flight-numbers">
          <flight-popover
            v-for="flight in scope.row.last_shell.flights"
            :key="flight.id"
            :flight="flight"
            :time="false"
          />
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="last_shell.base" label="Base" width="80" />
    <el-table-column prop="last_shell.station" label="Station" width="80" />

    <el-table-column label="Last Update" width="120">
      <template slot-scope="scope" v-if="scope.row.last_shell">
        {{ formattedLastUpdateDate(scope.row.last_shell.updated_at )}}
      </template>
    </el-table-column>

    <el-table-column width="58">
      <template slot-scope="scope">
        <button-el
          title="Edit"
          @click="handleEditPairingClick(scope.row.id)"
          icon="pencil-square-o"
          size="sm"
        />
      </template>
    </el-table-column>
  </sortable-table>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .flight-name {
    margin: 2px;
  }
</style>

<style lang="scss">
  .pairing-list {
    &__invalid-badge {
      margin: 4px 0;
    }
  }

  .flights-table {
    &__flight-numbers {
      display: flex;
      flex-flow: row wrap;
    }
  }
</style>
