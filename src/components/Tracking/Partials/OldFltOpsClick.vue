<script>
  import format from 'date-fns/format';
  import Card from 'Common/Card.vue';
  import RecordsTable from '../Common/RecordsTable.vue';

  export default {
    name: 'OldFltOpsClick',
    components: { RecordsTable, Card },
    methods: {
      formatTime(_r, _c, cellValue) {
        return format(new Date(cellValue), 'P, HH:mm:ss');
      },
    }
  };
</script>

<template>
  <card title="Old FLTOPS Usage">
    <records-table namespace="tracking/tables/old-fltops-click"
                   prefix="old"
                   :filters="{type: 'click-classic'}">
      <el-table-column label="Link" prop="event.link" />
      <el-table-column label="By" prop="user.full_name" />
      <el-table-column label="Triggered At" prop="triggered_at" sortable :formatter="formatTime" />
    </records-table>
  </card>
</template>

<style lang="scss" scoped>

</style>
