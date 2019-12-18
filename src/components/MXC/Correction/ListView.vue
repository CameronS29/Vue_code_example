<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import {RESET_CORRECTIONS} from "../../../store/modules/aircraft/consts";
  import Block from "Common/Block.vue";

  export default {
    props: ["aircraft"],
    computed: {
      ...mapGetters("aircraft/engineCorrections", [
        "corrections",
        "selectedAircraft"
      ])
    },
    components: {
      Block
    },
    methods: {
      ...mapActions("aircraft/engineCorrections", [
        "getCorrections",
        "deleteCorrection",
      ]),
      ...mapMutations("aircraft/engineCorrections", [
        RESET_CORRECTIONS
      ]),
      mount() {
        this.getCorrections(parseInt(this.aircraft));
      },
      deleteState(id) {
        this.$confirm('This will permanently delete this correction. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.deleteCorrection(id).then(() => {
            this.mount();
            this.$message({
              type: 'success',
              message: 'Delete completed'
            });
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          });
        });
      }
    },
    created() {
      this.mount();
    },
    watch: {
      aircraft(newId) {
        if (newId !== undefined) {
          this.mount();
        }
      },
    },
  }
</script>

<style lang="scss" src="../scss/swap.scss"></style>
<template>
  <block v-loading="!selectedAircraft">
    <span slot="title">
      <span v-if="selectedAircraft">{{ selectedAircraft.registration }}</span> Adjustment History
    </span>
    <el-table :data='corrections' border>
      <el-table-column prop="performed_on"
                       label="Date"
                       sortable>
      </el-table-column>
      <el-table-column prop="hobbs"
                       label="Hobbs"
                       sortable>
      </el-table-column>
      <el-table-column prop="tail_number"
                       label="Tail number"
                       sortable>
      </el-table-column>
      <el-table-column prop="aftt"
                       label="AFTT"
                       sortable>
      </el-table-column>
      <el-table-column prop="landings"
                       label="Landings"
                       sortable>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <router-link :to="{ name: 'aircraft_adjust_edit', params: {id: scope.row.id} }"
                       class="btn btn-success">
            <i class="fa fa-pencil" aria-hidden="true"></i> Edit
          </router-link>
          <button class="btn btn-danger" @click="deleteState(scope.row.id)">Delete</button>
        </template>
      </el-table-column>
    </el-table>
  </block>
</template>
