<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import {RESET_SWAPS} from "../../../../store/modules/aircraft/consts";
  import moment from "moment";
  import Block from "Common/Block.vue";
  import Column from "Common/Column.vue";
  import Columns from "Common/Columns.vue";

  export default {
    props: ["aircraft"],
    computed: {
      ...mapGetters("aircraft/engineSwaps", [
        "swaps",
        "selectedAircraft"
      ])
    },
    mounted() {
      this[RESET_SWAPS]();
      this.getAircrafts();
      this.getSwaps(this.aircraft);
    },
    methods: {
      ...mapActions("aircraft", [
        "getAircrafts",
      ]),
      ...mapActions("aircraft/engineSwaps", [
        "getSwaps",
        "removeSwap",
      ]),
      ...mapMutations("aircraft/engineSwaps", [
        RESET_SWAPS
      ]),
      formatDate(date) {
        return moment(date).format("MMM Do YYYY");
      },
      deleteSwap(swap) {
        this.$alert('Are you sure that you want to remove this swap?', "", {
          confirmButtonText: 'OK',
          callback: action => {
            if (action === "confirm") {
              this.removeSwap(swap);
            }
          }
        });
      }
    },
    components: {
      Block,
      Columns,
      Column
    },

  }
</script>

<style lang="scss" src="../../scss/swap.scss"></style>
<template>
  <block v-loading="swaps.length === 0">
    <span slot="title">
      <span v-if="selectedAircraft">{{ selectedAircraft.registration }}</span> Full Engine History
    </span>
    <el-table :data='swaps' border>
      <el-table-column
        label="Type"
        sortable>
        <template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.swap_type == 0">Swap</el-tag>
          <el-tag type="danger" v-if="scope.row.swap_type == 1">Remove-only</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="engine_data.serial_number"
                       label="Serial #"
                       sortable>
      </el-table-column>
      <el-table-column prop="date_of_removal"
                       label="Date Removed"
                       sortable>
        <template slot-scope="scope">
          {{ formatDate(scope.row.date_of_removal) }}
        </template>
      </el-table-column>
      <el-table-column prop="date_of_install"
                       label="Date Installed"
                       sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.date_of_install">{{ formatDate(scope.row.date_of_install) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="position"
                       label="Position"
                       sortable>
      </el-table-column>
      <el-table-column prop="last_log_data.id"
                       label="Last log id"
                       sortable>
      </el-table-column>
      <el-table-column prop="engine_data.engine_time"
                       label="Engine time"
                       sortable>
      </el-table-column>
      <el-table-column prop="engine_data.engine_cycles"
                       label="Engine cycles"
                       sortable>
      </el-table-column>
      <el-table-column width="160">
        <template slot-scope="scope">
          <router-link :to="{ name: 'engine_swap_edit', params: {id: scope.row.id} }"
                       class="el-button el-button--success">
            <i class="fa fa-pencil" aria-hidden="true"></i>
          </router-link>
          <el-button type="danger" icon="el-icon-delete" @click="deleteSwap(scope.row)"
                     v-if="!scope.row.default">

          </el-button>

        </template>
      </el-table-column>
    </el-table>
  </block>
</template>
