§<script>
  import { mapActions, mapGetters, mapState } from 'vuex';

  import { queryParam } from 'utils/routers';
  import {
    CURRENCY_BOOL_CONNECTED,
    CURRENCY_BOOLEAN,
    CURRENCY_NUMERIC,
    CURRENCY_PERIOD,
    CURRENCY_PERIODIC,
    CURRENCY_VARIATIVE,
    UNIT_NAMES
  } from 'store/modules/scheduling/crewCurrency';
  import { sleep } from 'utils/async';
  import Columns from './Types/Columns.vue';
  import TypeValue from './TypeValue.vue';
  import VariativeField from './EditPopovers/Variative.vue';

  const TABLE_NAMESPACE = 'tables/crew-currency';

  export default {
    created() {
      if (!this.pilots.length) {
        this.fetch();
      }
      if (!this.types.length) {
        this.fetchTypes();
      }
      if (!this.typeGroups.length) {
        this.fetchGroups();
      }

      window.addEventListener('resize', this.specifyHeight);
    },
    async mounted() {
      await this.$nextTick();
      await sleep(300);

      this.specifyHeight();
    },
    destroyed() {
      window.removeEventListener('resize', this.specifyHeight);
    },
    data() {
      return {
        TABLE_NAMESPACE,
        CURRENCY_BOOL_CONNECTED,
        CURRENCY_BOOLEAN,
        CURRENCY_PERIOD,
        CURRENCY_PERIODIC,
        CURRENCY_VARIATIVE,
        CURRENCY_NUMERIC,
        UNIT_NAMES,
        isActivePilots: true,
        tableHeight: window.innerHeight - 185,
      };
    },
    components: {
      TypeValue,
      Columns,
      VariativeField,
    },
    computed: {
      ...mapState('scheduling/crewCurrency', [
        'typeGroups',
      ]),
      ...mapGetters('scheduling/crewCurrency', [
        'types',
        'pilots',
        'categoryType',
        'groupedTypes',
      ]),
      searchQuery: queryParam({ param: 'search' }),
      filteredPilotList() {
        return this.pilots
          .filter((pilot) => {
            if (this.isActivePilots && !pilot.is_active) {
              return false;
            }

            if (this.searchQuery.length && (pilot.name.toLowerCase()
              .indexOf(this.searchQuery.toLowerCase()) === -1)) {
              return false;
            }

            return true;
          });
      },
    },
    methods: {
      ...mapActions('scheduling/crewCurrency', [
        'fetch',
        'fetchTypes',
        'fetchGroups',
      ]),
      specifyHeight() {
        const { top } = this.$refs.table.getBoundingClientRect();
        this.tableHeight = window.innerHeight - top;
      },
    },
    watch: {
      async types() {
        await this.$nextTick();
        await sleep(1000);

        this.specifyHeight();
      },
    },
  };
</script>

<template>
  <main class="crew-currency">
    <portal to="header">
      <div class="crew-currency__filters">
        <portal-target name="crew-currency" />

        <div class="crew-currency__active-pilots">
          <el-switch v-model="isActivePilots" active-text="Active pilots" />
        </div>
        <div class="crew-currency__search">
          <el-input
            size="small"
            placeholder="Search..."
            prefix-icon="el-icon-search"
            v-model="searchQuery" />
        </div>
      </div>
    </portal>

    <columns />

    <div class="crew-currency__table-wrapper" ref="table" :style="{ height: `${tableHeight}px` }">
      <table class="crew-currency__table">
        <thead>
          <tr>
            <th>Pilot/Category</th>
            <th v-for="type in types" v-if="type.enabled">
              {{ type.currency_meta.verbose_name }}
              <span class="crew-currency__unit-range"
                    v-if="(type.currency_type === CURRENCY_PERIODIC) && type.currency_meta.unit_range">
                {{ type.currency_meta.unit_range }} {{ UNIT_NAMES[type.currency_meta.unit_type] }}
              </span>
            </th>
          </tr>
        </thead>
        <tr :key="pilot.id" v-for="pilot in filteredPilotList">
          <td>
            <div class="crew-type-column">
              <div class="crew-type-column__cell">
                {{ pilot.name }}
                <el-tag size="mini" v-if="types.length" class="crew-currency__category-selector">
                  <type-value :style="{ margin: '-2px' }" :row="pilot" :type="categoryType" />
                </el-tag>
              </div>
            </div>
          </td>
          <td v-if="type.enabled" :key="type.id" v-for="type in types">
            <type-value :row="pilot" :type="type" />
          </td>
        </tr>
      </table>
    </div>
  </main>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .crew-currency {

    &__filters {
      display: flex;
      align-items: center;
    }

    &__active-pilots {
      margin-right: 15px;
    }

    &__search {
      display: flex;
      align-items: center;
      .sortable-table__search {
        margin-bottom: 0;
      }
    }
    &__table-wrapper {
      overflow-y: auto;
      width: calc(100% + 50px);
      margin: 0 -25px;

      @media screen and (max-width: $screen-xs-max) {
        margin: 0 -15px;
        width: calc(100% + 30px);
      }
    }
    &__table {
      transform: translate3d(0, 0, 0);
      width: 100%;
      background: #fff;
      tr {
        &:hover {
          td {
            background-color: rgba(0, 0, 0, .05);
          }
        }
      }

      th {
        background: #eef6f6;
        position: sticky;
        top: -1px;
        padding: 5px;
        border: 1px solid #dfeceb;
        z-index: 90;
        min-width: 57px;
      }

      td {
        height: 100%;
        border: 1px solid #dfeceb;
        white-space: nowrap;
      }
    }
    &__category-selector {
      cursor: pointer;
    }
    &__unit-range {
      display: block;
      font-size: 10px;
      opacity: .6;
    }
  }
</style>
