<script>
  import { mapActions, mapMutations, mapGetters } from 'vuex';
  import { Select, Option } from 'element-ui';

  import Badge from 'Common/Badge.vue';
  import Collapse from 'Common/Collapse.vue';
  import SearchInput from 'Common/SearchInput.vue';
  import ViewPortal from 'Common/ViewPortal.vue';

  import { UPDATE_LOG } from 'store/modules/wb/consts';
  import { queryParam } from '../../../utils/routers';

  import OpenLogs from './Partials/Open.vue';
  import CompletedLogs from './Partials/Completed.vue';

  import CreateLogButton from './CreateLogButton.vue';
  import { connectMixin } from '../../../sockets';

  export default {
    mixins: [connectMixin('wb:list')],

    components: {
      Badge,
      Collapse,
      OpenLogs,
      CompletedLogs,
      CreateLogButton,
      SearchInput,
      ViewPortal,
      ElSelect: Select,
      ElOption: Option,
    },

    created() {
      this.getAllOptions();
    },

    computed: {
      ...mapGetters('wb', ['availableAircraftTypes']),
      searchQuery: queryParam({ param: 'search' }),
      acType: queryParam({
        param: 'type',
        mapper: t => (Number(t) || undefined),
      }),
    },

    methods: {
      ...mapActions('wb', ['getAllOptions']),
      ...mapMutations('wb', [UPDATE_LOG]),
    },
  };
</script>

<template>
  <div>
    <view-portal to="header">
      <div class="LogList__controls">
        <div class="LogList__button">
          <create-log-button />
        </div>

        <div class="LogList__search">
          <el-select class="LogList__ac-type"
                     v-model="acType"
                     placeholder="A/C Type"
                     size="small"
                     clearable>
            <el-option
              v-for="ac of availableAircraftTypes"
              :key="ac.id"
              :label="ac.name"
              :value="ac.id"
            />
          </el-select>
          <search-input class="LogList__search-input" v-model="searchQuery" />
        </div>
      </div>
    </view-portal>

    <div class="wb-tables">
      <div class="wb-table">
        <collapse title="Open Logs" gutter-color="#1C84C6">
          <open-logs :search="searchQuery" />
        </collapse>
      </div>

      <div class="wb-table">
        <collapse title="Pinned Logs" gutter-color="#ED5565">
          <completed-logs :search="searchQuery" />
        </collapse>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import "../../../../scss/bs-variables";

  .wb-tables {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    .wb-table {
      flex: 0 1 calc(50% - 10px);
      max-width: calc(50% - 10px);
    }
  }

  .LogList {
    &__controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      flex: 1;
    }

    &__button {
      display: flex;
      align-content: center;
      margin-right: auto;
    }

    &__search {
      display: flex;
      flex-flow: row nowrap;
      max-width: 350px;
    }

    &__ac-type {
      flex: 1 1 40%;
      margin-right: 10px;
    }

    &__search-input {
      flex: 1 1 60%;
    }
  }

  @media (max-width: $screen-md-max) {
    .wb-tables {
      flex-flow: row wrap;
      .wb-table {
        overflow: scroll;
        flex: 0 0 100%;
        max-width: 100%;
        .p-md {
          padding: 0;
        }
      }
    }
  }

  @media (max-width: $screen-sm-max) {
    .LogList__controls {
      margin-bottom: 10px;
    }
  }

  @media (max-width: $screen-xs-max) {
    .LogList {
      &__search {
        margin-top: 15px;
        flex: 1 1 100%;

        .SearchInput {
          display: block;
        }
      }

      &__controls {
        margin: 10px 0;
      }
    }
  }
</style>
