<script>
  import {mapActions, mapState, mapGetters, mapMutations} from 'vuex';
  import Block from 'Common/Block.vue';

  export default {
    name: 'RoutesView',
    components: {
      Block,
    },
    computed: {
      ...mapState('routeplanningGantt/routes', [
        'routes',
        'search',
        'origin',
        'destination',
        'type',
      ]),
      ...mapGetters('airports', ['airports']),
      ...mapGetters('routeplanningGantt/routes', [
        'filteredRoutes',
        'availableAirports',
        'availableTypes',
      ]),
      destinationValue: {
        get() {
          return this.destination;
        },
        set(value) {
          this.setDestination(value);
        },
      },
      originValue: {
        get() {
          return this.origin;
        },
        set(value) {
          this.setOrigin(value);
        },
      },
      typeValue: {
        get() {
          return this.type;
        },
        set(value) {
          this.setType(value);
        },
      },
    },
    methods: {
      ...mapActions('routeplanningGantt/routes', [
        'getRoutes',
        'calcRoutes',
        'calcRoute',
        'patchRoute',
      ]),
      ...mapMutations('routeplanningGantt/routes', [
        'setSearch',
        'setOrigin',
        'setDestination',
        'setType',
      ]),
      async handleCalcRoutes() {
        this.loading = true;
        await this.calcRoutes(this.since);
        this.loading = false;
      },
      async handleCalcNewRoutes() {
        this.loading = true;
        await this.calcNewRoutes(this.since);
        this.loading = false;
      },
      handleAvgChange({ id }, value) {
        this.patchRoute({ id, avg: value });
      },
      recalcSingle(id) {
        this.calcRoute({ id, since: this.since });
      },
    },

    async created() {
      if (!this.routes.length) {
        await this.getRoutes();
      }
    },
    data() {
      return {
        since: null,
        loading: false,
      };
    },
  };
</script>

<template>
  <div>
    <div class="route-list">
      <block title="Route list view" class="route-list__table" v-loading="this.loading">
        <el-table :data='filteredRoutes' border size="mini">
          <el-table-column :width="90" prop="origin" sortable label="Origin"/>
          <el-table-column :width="90" prop="destination" sortable label="Dest."/>
          <el-table-column :width="120" prop="type_name" sortable label="Aircraft"/>
          <el-table-column prop="avg" sortable label="Average h">
            <template slot-scope="scope">
              <div class="change-avg" v-loading="scope.row.loading">
                <el-input size="mini" :value="scope.row.avg" @input="value => handleAvgChange(scope.row, value)"></el-input>
                <el-button
                  size="mini"
                  icon="fa fa-calculator"
                  type="text"
                  :disabled="!since"
                  @click="recalcSingle(scope.row.id)"
                ></el-button>
              </div>
            </template>
          </el-table-column>

        </el-table>
      </block>
      <div class="route-list__config">
        <div class="route-config">
          <div class="route-config__desc">
            Pick <strong>start date</strong> to recalculate average
          </div>
          <el-date-picker class="route-config__picker" v-model="since" format="MM/dd/yyyy" value-format="MM/dd/yyyy"
            type="date">
          </el-date-picker>
          <div class="route-config__desc">
            Apply this date individually in table <strong>OR</strong>
          </div>
          <div class="route-config__apply">
            <el-button size="small" :disabled="!since || this.loading" @click="handleCalcRoutes">
              Apply to all
            </el-button>
            <el-button size="small" :disabled="!since || this.loading" @click="handleCalcRoutes">
              Only new routes
            </el-button>
          </div>
          <div class="route-config__filters">
            <el-select size="small" v-model="originValue" placeholder="Origin" filterable clearable>
              <el-option v-for="code in availableAirports" :key="code" :value="code" :label="code" />
            </el-select>
          </div>
          <div class="route-config__filters">
            <el-select size="small" v-model="destinationValue" placeholder="Destination" filterable clearable>
              <el-option v-for="code in availableAirports" :key="code" :value="code" :label="code" />
            </el-select>
          </div>
          <div class="route-config__filters">
            <el-select size="small" v-model="typeValue" placeholder="Type" filterable clearable>
              <el-option v-for="code in availableTypes" :key="code" :value="code" :label="code" />
            </el-select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .route-list {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: flex-start;

    &__table {
      flex: 0 0 600px;
      margin-right: 20px;

      .el-table__row {
        td {
          padding: 0;
        }
      .el-button--mini.is-round {
        padding: 3px 9px
      }
      }
    }

    &__config {
      position: sticky;
      top: 10px;
    }

  }
  .route-config {
    flex: 0 0 230px;
      color: #7d7d7d;
    &__desc {
      margin-bottom: 5px;
    }
    &__title {
      font-weight: bold;
      font-size: 16px;
    }
    &__picker {
      margin-bottom: 10px;
    }
    &__apply {
      display: flex;
      margin-bottom: 20px;
    }
    &__filters {
    }
  }
  .change-avg {
    display: flex;
    flex-flow: row nowrap;
    .el-input--mini .el-input__inner {
      height: 16px;
      width: 30px;
      padding: 0 5px;
      line-height: 17px;
    }
    .el-input {
      flex: 0 1;

    }
    .el-button {
      padding: 0 5px;
    }
  }
</style>
