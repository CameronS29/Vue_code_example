<script>
  import {mapGetters, mapState, mapActions} from 'vuex';
  import Block from '../../../Common/Block.vue';
  import ViewPortal from 'Common/ViewPortal.vue';

  export default {
    computed: {
      ...mapState("aircraft", [
        "aircrafts"
      ])
    },
    methods: {
      ...mapActions("aircraft", [
        "getAircrafts"
      ]),
      create() {
        this.$router.push({name: 'aircraft_new'});
      }
    },
    components: {
      ViewPortal,
      Block
    },
    created() {
      this.getAircrafts();
    }
  }

</script>

<template>
  <div>
    <block title="Aircraft list view">
      <view-portal slot="title" to="header" min-width="768px">
        <el-button type="primary" icon="plus" class="engine-list__button" @click="create" size="small">
          Create new aircraft
        </el-button>
      </view-portal>

      <el-table :data='aircrafts' border>
        <el-table-column label="Engine 1" width="180" sortable>
          <template slot-scope="scope">
            <router-link
              :to="{ name: 'engine_swap', params: {aircraftId: scope.row.id, enginePosition:1} }"
              class="el-button el-button--primary el-button--small">
              <i class="fa fa-exchange" aria-hidden="true"></i>
              <span v-if="scope.row.engine_1">{{scope.row.engine_1.serial_number}}</span>
              <span v-else>No engine</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Engine 2" width="180" sortable>
          <template slot-scope="scope">
            <router-link
              v-if="scope.row.engine_2"
              :to="{ name: 'engine_swap', params: {aircraftId: scope.row.id, enginePosition:2} }"
              class="el-button el-button--primary el-button--small">
              <i class="fa fa-exchange" aria-hidden="true"></i>
              <span v-if="scope.row.engine_2">{{scope.row.engine_2.serial_number}}</span>
              <span v-else>No engine</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="registration" fixed sortable label="Tail #" width="190">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.type.name }}</el-tag>
            {{ scope.row.registration }}
          </template>
        </el-table-column>

        <el-table-column label="At install">
          <el-table-column prop="base_hobbs" sortable width="100" label="Hobbs"></el-table-column>
          <el-table-column prop="base_aftt" width="100" sortable label="AFTT"></el-table-column>
          <el-table-column prop="base_airframe_landings" width="100" sortable label="Landings"></el-table-column>
        </el-table-column>
        <el-table-column label="Actual">
          <el-table-column prop="hobbs" width="100" sortable label="Hobbs"></el-table-column>
          <el-table-column prop="aftt" width="100" sortable label="AFTT"></el-table-column>
          <el-table-column prop="airframe_landings" sortable label="Landings"></el-table-column>
        </el-table-column>
        <el-table-column fixed="right" label="" width="150">
          <template slot-scope="scope">
            <router-link :to="{ name: 'aircraft_edit', params: {id: scope.row.id} }"
                         class="el-button el-button--success el-button--small">
              <i class="fa fa-pencil" aria-hidden="true"></i> edit
            </router-link>
          </template>
        </el-table-column>
      </el-table>
    </block>
  </div>
</template>
