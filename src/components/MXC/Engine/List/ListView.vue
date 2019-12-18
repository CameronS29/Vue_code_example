<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import Modal from "../../../Common/Modal.vue";
  import {RESET_ENGINE} from "../../../../store/modules/aircraft/consts";
  import Block from "Common/Block.vue";
  import ViewPortal from 'Common/ViewPortal.vue';

  export default {
    computed: {
      ...mapGetters("engine", [
        "engines"
      ]),
      ...mapGetters("user", [
        "isAdmin"
      ])
    },
    methods: {
      ...mapActions("engine", [
        "getAllEngines",
        "activateEngine",
        "deactivateEngine",
        "removeEngine",
      ]),
      ...mapMutations("engine", [
        RESET_ENGINE
      ]),
      closeModal() {
        this.$router.push({name: "engine_list"});
      },
      create(){
        this.$router.push({name: 'engine_create'})
        this[RESET_ENGINE]();
      },
      inactivate(engine) {
        this.$alert('Are you sure that you want to deactivate this engine?', engine.serial_number, {
          confirmButtonText: 'OK',
          callback: action => {
            if (action === 'confirm') {
              this.deactivateEngine(engine).then(() => this.$message({
                message: `Engine was deactivated`
              }));
            }
          }
        });

      },
      remove(engine) {
        this.$alert('Are you sure that you want to removve this engine?', engine.serial_number, {
          confirmButtonText: 'OK',
          type: 'error',
          callback: action => {
            if (action === 'confirm') {
              this.removeEngine(engine).then(() => {
                this.getAllEngines();
                this.$message({
                  message: `Engine was removed`
                });
              }).catch(() => this.$message({
                type: 'error',
                message: `This engine cannot be removed as it has active logs`
              }));
            }
          }
        });

      },
      activate(engine) {
        this.$alert('Are you sure that you want to activate this engine?', engine.serial_number, {
          confirmButtonText: 'OK',
          callback: action => {
            if (action === 'confirm') {
              this.activateEngine(engine).then(() => this.$message({
                type: 'info',
                message: `Engine was activated`
              }));
            }
          }
        });

      },
    },
    components: {
      ViewPortal,
      Modal,
      Block
    },
    created() {
      this.getAllEngines();
    }
  }
</script>

<template>
  <block title="List of engines">
    <modal :show="$route.meta.showModal" @close="closeModal" transparent>
      <div class="engine__modal-container">
        <router-view></router-view>
      </div>
    </modal>

      <div class="engine-list">
        <view-portal min-width="768px" to="header">
          <el-button type="primary" icon="plus" class="engine-list__button" @click="create">
            Create new engine
          </el-button>
        </view-portal>

        <el-table :data='engines' border>
          <el-table-column prop="serial_number"
                           fixed
                           sortable
                           label="S/N">
          </el-table-column>
          <el-table-column prop="type"
                           sortable
                           label="Type">
          </el-table-column>

          <el-table-column label="At install">
            <el-table-column prop="base_engine_cycles"
                             sortable
                             label="Engine Cycles">
            </el-table-column>
            <el-table-column prop="base_engine_time"
                             sortable
                             label="Engine Time">
            </el-table-column>
          </el-table-column>
          <el-table-column label="Current">
            <el-table-column prop="engine_cycles"
                             sortable
                             label="Engine Cycles">
            </el-table-column>
            <el-table-column prop="engine_time"
                             sortable
                             label="Engine Time">
            </el-table-column>
          </el-table-column>
          <el-table-column label="Installed in">
            <template slot-scope="scope">
              <span v-if="scope.row.installed_at_1">
                {{ scope.row.installed_at_1.registration }} <el-tag type="gray">#1</el-tag>
              </span>
              <span v-if="scope.row.installed_at_2">
                {{ scope.row.installed_at_2.registration }} <el-tag type="gray">#2</el-tag>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Actions" fixed="right" min-width="180">
            <template slot-scope="scope">
              <el-button type="danger" size="small" @click="remove(scope.row)" icon="delete" v-if="isAdmin">
                Delete
              </el-button>
              <el-button-group v-if="isAdmin">
                <el-button type="primary" size="small" icon="edit"
                  @click="$router.push({name: 'engine_edit', params: {id: scope.row.id}})">Edit</el-button>
                <el-button type="danger" size="small" @click="inactivate(scope.row)" v-if="scope.row.active">Disable</el-button>
                <el-button type="info" size="small" @click="activate(scope.row)" v-if="!scope.row.active">Activate</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
  </block>
</template>
<style lang="scss">
  .engine-list {
    .engine-list__button {
      margin-bottom: 5px;
    }
  }
</style>
