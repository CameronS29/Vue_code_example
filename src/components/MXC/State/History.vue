<script>
  import { mapActions, mapGetters } from 'vuex';
  import { TableColumn, Tooltip } from 'element-ui';

  import Block from 'Common/Block.vue';
  import ViewPortal from 'Common/ViewPortal.vue';

  import Selectize from '../../fields/Selectize.vue';
  import Datepicker from '../../fields/Datepicker.vue';

  import { queryParam } from '../../../utils/routers';
  import ResultTable from './ResultTable.vue'

  export default {
    name: 'StateHistoryPage',

    props: {
      isReadOnly: {
        type: Boolean,
        default: false,
      },
    },

    components: {
      Block,
      Selectize,
      Datepicker,
      ResultTable,
      ViewPortal,
    },

    created() {
      this.getAircrafts();
    },

    computed: {
      ...mapGetters('aircraft', ['aircrafts']),

      aircraft: queryParam({ param: 'aircraft' }),
      date_0: queryParam({ param: 'date_0' }),
      date_1: queryParam({ param: 'date_1' }),
      type: queryParam({ param: 'm-type' }),

      filters() {
        const { aircraft, date_0, date_1, type } = this;
        return { aircraft, date_0, date_1, type };
      },
    },

    methods: {
      ...mapActions('aircraft', ['getAircrafts']),
    },
  };
</script>

<template>
  <div>
    <view-portal to="header" min-width="768px">
      <div class="state-history-filters">
        <div class="state-history-filters__date-range">
          <datepicker v-model="date_0" />
          一
          <datepicker v-model="date_1" />
        </div>
        <el-select v-model="aircraft"
                   size="small"
                   class="state-history-filters__select"
                   placeholder="Tail number"
                   filterable
                   clearable >
          <el-option
            v-for="aircraft of aircrafts"
            :key="aircraft.id"
            :label="aircraft.registration"
            :value="aircraft.id"
          />
        </el-select>
        <el-select v-model="type"
                   size="small"
                   class="state-history-filters__select"
                   placeholder="Type"
                   clearable >
          <el-option :key="'hobbs'" :label="'HOBBS'" :value="'hobbs'" />
          <el-option :key="'location'" :label="'Location'" :value="'location'" />
          <el-option :key="'all'" :label="'All'" :value="'all'" />
        </el-select>
      </div>
    </view-portal>

    <result-table
      :aircraft="aircraft"
      :date_0="date_0"
      :date_1="date_1"
      :type="type"
      :is-read-only="isReadOnly"
    />
  </div>
</template>

<style lang="scss" src="../../design/scss/layout.scss"></style>
<style lang="scss">
  @import "../../../../scss/bs-variables";

  .state-history-filters {
    display: flex;
    align-items: center;

    > *:not(:last-child) {
      margin-right: 10px;
    }

    &__select {
      width: 160px;
    }

    &__date-range {
      display: flex;
      align-items: center;
      border-right: 1px solid #cccccc78;
      padding-right: 10px;
      margin-right: 15px !important;

      .form-group {
        margin: 0 5px;
      }
    }
  }

</style>
