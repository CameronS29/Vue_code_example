<script>
  import { mapGetters } from 'vuex';
  import TableColumn from 'element-ui/lib/table-column';
  import Tag from 'element-ui/lib/tag';

  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED,
  } from 'store/modules/flightlog/consts';

  import SortableTable from 'Common/SortableTable';
  import ManifestActions from './ManifestActions.vue';

  export default {
    props: {
      status: {
        type: [Array, Number],
        default: () => ([]),
      },

      prefix: {
        type: String,
        default: '',
      },

      showHobbs: {
        type: Boolean,
        default: false,
        required: false,
      },

      searchable: {
        type: [Boolean, String],
        default: true,
        required: false,
      },

      filters: {
        type: Object,
        default: () => ({}),
      },

      namespace: {
        type: String,
        required: true,
      },
    },

    components: {
      SortableTable,
      TableColumn,
      ManifestActions,
      Tag,
    },

    computed: {
      ...mapGetters('user', [
        'isAdmin',
        'isDispatcher',
        'isPilot',
      ]),

      pilotPage() {
        return this.$route.name.indexOf('pilot_') > -1;
      },

      mergedFilters() {
        const { filters, status } = this;
        return { status, ...filters };
      },
    },

    methods: {
      badgeType({ status }) {
        return {
          [STATUS_OPEN]: 'primary',
          [STATUS_PENDING_PIC]: 'primary',
          [STATUS_DISPATCH_PENDING]: 'success',
          [STATUS_DISPATCH_RE_OPEN]: 'info',
          [STATUS_COMPLETED]: 'danger',
        }[status];
      },

      hasComments({ comments_count }) {
        return comments_count > 0;
      },

      canDelete(manifest) {
        if (this.pilotPage) {
          return this.isAdmin || (this.isPilot && !manifest.has_closed_log);
        }
        return this.isAdmin || (
          this.isDispatcher
          && manifest.status === STATUS_OPEN
          && !manifest.has_closed_log
        );
      },
    },
  };
</script>

<template>
  <sortable-table
    class="dispatch-dashboard__manifests-list"
    :namespace="namespace"
    :filters="mergedFilters"
    :query-prefix="prefix"
    :searchable="searchable"
  >
    <table-column prop="status" label="Status" width="150" align="center" sortable>
      <template slot-scope="props">
        <tag :type="badgeType(props.row)">
          {{ props.row.verbose_status }}
          <i v-if="hasComments(props.row)" title="Has comments" class="fa fa-commenting" aria-hidden="true"/>
        </tag>
      </template>
    </table-column>

    <table-column label="Actions" width="120">
      <template slot-scope="props">
        <manifest-actions :can-delete="canDelete(props.row)" :manifest="props.row"/>
      </template>
    </table-column>

    <table-column label="Manifest #" minWidth="110" sortable="number">
      <template slot-scope="props">
        {{ props.row.number }}
      </template>
    </table-column>

    <table-column prop="tail_number" label="Tail #" sortable="aircraft__registration"/>

    <table-column label="A/C Type" prop="aircraft_type_name" minWidth="100" sortable="aircraft__type__type"/>

    <table-column label="Date" prop="created_on" minWidth="90" sortable/>

    <table-column label="PIC" prop="pic_name" minWidth="140" sortable="pic_profile__initials"/>

    <table-column label="SIC" prop="sic_name" minWidth="140" sortable="sic_profile__initials"/>

    <table-column v-if="showHobbs" label="Start Hobbs" prop="initial_hobbs_stored"  minWidth="100"/>

    <table-column v-if="showHobbs" label="End Hobbs" prop="final_hobbs_stored"
                  minWidth="100"/>

    <table-column label="# of Logs" prop="flightlog_count" align="right" minWidth="100"/>
  </sortable-table>
</template>

<style>
  .dispatch-dashboard__manifests-list .cell {
    padding: 0 7px !important;
  }

  .dispatch-dashboard__manifests-list .el-table__row {
    position: relative;
  }
</style>
