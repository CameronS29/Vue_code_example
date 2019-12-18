<script>
  import Block from 'Common/Block.vue';
  import { mapMutations, mapActions, mapGetters, mapState } from 'vuex';
  import {SET_MONTH, SET_YEAR} from "store/modules/reports/t100";

  export default {
    name: "View",
    components: {
      Block
    },
    computed: {
      ...mapGetters('reports/t100', [
        't100Data',
        'reportMonth'
      ]),
      ...mapState('reports/t100', [
        'year',
        'month'
      ]),
      monthChoice: {
        get() {
          return this.reportMonth;
        },
        set(val) {
          this[SET_YEAR](val.getFullYear());
          this[SET_MONTH](val.getMonth()+1);
          this.getT100Report();
        }
      }
    },
    methods: {
      ...mapActions('reports/t100', [
        'getT100Report'
      ]),
      ...mapMutations('reports/t100', [
        SET_YEAR,
        SET_MONTH,
      ])
    },
    mounted(){
      this.getT100Report();
    }
  }
</script>

<template>
  <div>
    <portal to="header">
      <div>
        <a :href="`/reports/api/t100/${year}-${month}/csv/`" class="el-button el-button--primary">
          <i class="el-icon-document"></i>
          Get CSV
        </a>
        <el-date-picker v-model="monthChoice" type="month" placeholder="Pick a month"></el-date-picker>
      </div>
    </portal>
    <block title="T100">
      <el-table :data="t100Data">
        <el-table-column label="Data">
          <template slot-scope="scope">S</template>
        </el-table-column>
        <el-table-column label="Entity Code">
          <template slot-scope="scope">1177</template>
        </el-table-column>
        <el-table-column label="Year">
          <template slot-scope="scope">{{year}}</template>
        </el-table-column>
        <el-table-column label="Month">
          <template slot-scope="scope">
            <span v-if="month < 10">0</span>{{ month }}
          </template>
        </el-table-column>
        <el-table-column label="Origin" prop="origin__iata"></el-table-column>
        <el-table-column label="Destination" prop="destination__iata"></el-table-column>
        <el-table-column label="Service Class">
          <template slot-scope="scope">F</template>
        </el-table-column>
        <el-table-column label="Aircraft " prop="actual_aircraft__type__t100_code"></el-table-column>
        <el-table-column label="Cabin Configuration">
          <template slot-scope="scope">1</template>
        </el-table-column>
        <el-table-column label="Departures Performed" prop="performed_departures"></el-table-column>
        <el-table-column label="Available Payload" prop="available_payload"></el-table-column>
        <el-table-column label="Available Seats" prop="available_seats"></el-table-column>
        <el-table-column label="Segment Passengers" prop="segment_passengers"></el-table-column>
        <el-table-column label="Segment Freight">
          <template slot-scope="scope">0</template>
        </el-table-column>
        <el-table-column label="Segment Mail">
          <template slot-scope="scope">0</template>
        </el-table-column>
        <el-table-column label="Departures Performed" prop="scheduled_departures"></el-table-column>
        <el-table-column label="Ramp to Ramp Minutes" prop="ramp_ramp"></el-table-column>
        <el-table-column label="Airborne Time" prop="airbone"></el-table-column>
      </el-table>
    </block>
  </div>
</template>

<style scoped>

</style>
