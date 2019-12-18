<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';

  import Selectize from '../fields/Selectize.vue';
  import Block from '../Common/Block.vue';
  import StateSync from './Aircraft/Partials/StateSync.vue';
  import { SET_TAIL_NUMBER_FILTER } from '../../store/modules/aircraft/consts';
  import ViewPortal from 'Common/ViewPortal.vue';

  export default {
    props: {
      isReadOnly: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapGetters('aircraft', [
        'filteredAircrafts',
        'aircrafts',
        'tailNumberFilter'
      ]),
      tailNumberFilterValue: {
        get() {
          return this.tailNumberFilter;
        },
        set(value) {
          this[SET_TAIL_NUMBER_FILTER](value);
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.getAircrafts();
      });
    },
    methods: {
      ...mapActions('aircraft', [
        'getAircrafts'
      ]),
      ...mapMutations('aircraft', [
        SET_TAIL_NUMBER_FILTER
      ]),
      create() {
        this.$router.push({ name: 'aircraft_new' });
      }
    },
    components: {
      ViewPortal,
      Selectize,
      StateSync,
      Block,
    },
  };
</script>
<style lang="scss" src="./scss/dashboard.scss"></style>
<template>
  <div :key="isReadOnly">
    <view-portal slot="title" to="header" min-width="768px">
      <div class="aircraft-controls">
        <el-select class="aircraft-controls__tail-select"
                   v-model="tailNumberFilterValue"
                   placeholder="Filter by tail number"
                   clearable
                   filterable>
          <el-option
            v-for="aircraft of aircrafts"
            :key="aircraft.registration"
            :label="aircraft.registration"
            :value="aircraft.registration"
          />
        </el-select>
        <el-button v-if="!isReadOnly" type="primary" icon="plus" class="engine-list__button" @click="create">
          Create new aircraft
        </el-button>
      </div>
    </view-portal>
    <div class="aircraft-table" v-loading="aircrafts.length === 0">
      <el-table :data='filteredAircrafts' border size="mini">
        <el-table-column prop="registration"
                         label="Tail #"
                         fixed
                         width="130"
                         sortable>
          <template slot-scope="scope">
            <div v-if="isReadOnly">
              <strong>{{ scope.row.registration }}</strong>
            </div>
            <div v-else>
              <router-link :to="{ name: 'aircraft_edit', params: {id: scope.row.id} }"
                           class="el-button el-button--success el-button--mini">
                <i class="fa fa-pencil" aria-hidden="true"></i> {{ scope.row.registration }}
              </router-link>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Corrections" width="130" v-if="!isReadOnly">
          <template slot-scope="scope">
            <router-link
              :to="{ name: 'aircraft_adjust', params: {aircraftId: scope.row.id} }"
              class="correction-btn">
              <i class="fa fa-pencil" aria-hidden="true" />
            </router-link>
            <router-link :to="{ name: 'aircraft_adjust_list', params: {aircraft: scope.row.id} }"
                         class="correction-btn">
              <i class="fa fa-history" aria-hidden="true" />
            </router-link>
          </template>
        </el-table-column>

        <el-table-column
          label="AFTT"
          prop="aftt"
          width="100"
          sortable></el-table-column>
        <el-table-column
          label="Landings"
          prop="airframe_landings"
          width="100"
          sortable></el-table-column>
        <el-table-column
          label="Hobbs"
          width="180"
          sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.hobbs }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="state.hobbs" sortable="hobbs" label="AFTT/Hobbs Δ" width="150">
          <template slot-scope="scope">
            {{ Math.abs(Math.round((scope.row.aftt - parseFloat(scope.row.hobbs))*100)/100) }}
          </template>
        </el-table-column>
        <el-table-column
          label="Location"
          prop="location"
          width="100"
          sortable></el-table-column>
        <el-table-column label="Engine 1">
          <el-table-column
            label="Serial"
            width="210"
            sortable>
            <template slot-scope="scope">
              <div v-if="isReadOnly">
                <el-tag>
                  <span v-if="scope.row.engine_1">{{scope.row.engine_1.serial_number}}</span>
                  <span v-else>No engine</span>
                </el-tag>
              </div>
              <div v-else>
                <router-link
                  :to="{ name: 'engine_swap', params: {aircraftId: scope.row.id, enginePosition:1} }"
                  class="swap-btn">
                  <i class="fa fa-exchange" aria-hidden="true"></i>
                  <span v-if="scope.row.engine_1">{{scope.row.engine_1.serial_number}}</span>
                  <span v-else>No engine</span>
                </router-link>
                <router-link :to="{ name: 'engine_swap_list', params: {aircraft: scope.row.id} }"

                             class="swap-btn">
                  <i class="fa fa-history" aria-hidden="true"></i>
                </router-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="engine_1.engine_time"
                           label="Hrs"
                           sortable
                           width="100">
          </el-table-column>
          <el-table-column prop="engine_1.engine_cycles"
                           label="Cycles"
                           width="125"
                           sortable>
          </el-table-column>
        </el-table-column>
        <el-table-column label="Engine 2">
          <el-table-column
            label="Serial"
            width="180"
            sortable>
            <template slot-scope="scope">
              <div v-if="scope.row.type.number_of_engines == 2">
                <div v-if="isReadOnly">
                  <el-tag>
                    <span v-if="scope.row.engine_2">{{scope.row.engine_2.serial_number}}</span>
                    <span v-else>No engine</span>
                  </el-tag>
                </div>
                <div v-else>
                  <router-link :to="{ name: 'engine_swap', params: {aircraftId: scope.row.id, enginePosition:2} }"
                               class="swap-btn">
                    <i class="fa fa-exchange" aria-hidden="true" />
                    <span v-if="scope.row.engine_2">{{scope.row.engine_2.serial_number}}</span>
                    <span v-else>No engine</span>
                  </router-link>
                  <router-link :to="{ name: 'engine_swap_list', params: {aircraft: scope.row.id} }"
                               class="swap-btn">
                    <i class="fa fa-history" aria-hidden="true" />
                  </router-link>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="engine_2.engine_time"
                           label="Hrs"
                           width="100"
                           sortable>
          </el-table-column>
          <el-table-column prop="engine_2.engine_cycles"
                           label="Cycles"
                           sortable>
          </el-table-column>
        </el-table-column>

        <el-table-column fixed="right" width="100" v-if="!isReadOnly">
          <template slot-scope="scope">
            <state-sync :aircraft="scope.row.id" @done="getAircrafts"></state-sync>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
