<script>
  import { keyBy } from 'lodash';

  export default {
    props: {
      original: Object,
      change: Object,
    },
    computed: {
      changeEquip() {
        return keyBy(this.change.AircraftEquipmentTimes, 'LookupId');
      },
    },
    methods: {
      handleDecline() {
        this.$emit('decline');
      },
      handleAccept() {
        this.$emit('accept');
      },
    },
  };
</script>
<template>
  <el-dialog :title="`Changes in ${original.RegistrationNumber}`" :visible="true" @close="handleDecline">
    <table class="change-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Original</th>
          <th>To be changed</th>
        </tr>
      </thead>
      <tr>
        <td rowspan="2">Airframe</td>
        <td>{{ original.TotalTime }}</td>
        <td>{{ change.TotalTime }} h</td>
      </tr>
      <tr>

        <td>{{ original.Landings }}</td>
        <td>{{ change.Landings }} landings</td>
      </tr>
      <template v-for="eq of original.AircraftEquipmentTimes">
        <tr>
          <td rowspan="2">{{ eq.Type }}</td>
          <td> {{ eq.Cycles }} </td>
          <td>
            <span v-if="changeEquip[eq.LookupId] && changeEquip[eq.LookupId].Cycles">{{ changeEquip[eq.LookupId].Cycles }} cycles</span>
            <span v-else-if="!eq.Cycles">Cycles not set</span>
            <span v-else>Not changed</span>
          </td>
        </tr>
        <tr>
          <td> {{ eq.Hours }} </td>
          <td>
            <span v-if="changeEquip[eq.LookupId] && changeEquip[eq.LookupId].Hours">{{ changeEquip[eq.LookupId].Hours }} hours</span>
            <span v-else-if="!eq.Hours">Hours not set</span>
            <span v-else>Not changed</span>
          </td>
        </tr>
      </template>
    </table>
    <div class="change-table__actions">
      <el-button type="success" @click="handleAccept">Confirm</el-button>
      <el-button type="danger" @click="handleDecline">Decline</el-button>
    </div>
  </el-dialog>
</template>
<style lang="scss">
  .change-table {
    td {
      padding: 15px;
      border-top: 1px solid #ddd;
    }
    thead {
      tr {
        background: #e8f7ff;
      }
      th {
        padding: 15px;
      }
    }
    &__actions {
      display: flex;
      flex-flow: row nowrap;
      button {
        flex: 1 1 50%;
      }
    }
  }
</style>
