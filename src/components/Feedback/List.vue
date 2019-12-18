<script>
  import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
  import { DateTime } from 'luxon';
  import { find } from 'lodash';
  import qs from 'query-string';
  import TreeView from "vue-json-tree-view";

  import { tableApi } from 'api/feedback';
  import ButtonEl from 'Common/Button.vue';
  import SortableTable from "Common/SortableTable";
  import Modal from "Common/Modal.vue";

  export default {
    components: { ButtonEl, SortableTable, Modal },
    data() {
      return { json: null };
    },
    methods: {
      navigateToScreenShot(feedbackRecord) {
        const screenShot = new Image();
        const { appOffsetWidth } = feedbackRecord.user_info;

        screenShot.src = feedbackRecord.screenshot_data.screenshot;

        const win = window.open('');

        win.document.write(
          `<style>body{margin: 0;} img{width: ${appOffsetWidth}}</style>
          ${screenShot.outerHTML}`
        );
      },
      viewApp(feedbackRecord) {
        const getParamsString = qs.stringify({
          ...feedbackRecord.user_info.getParams,
          feedbackRecordId: feedbackRecord.id,
        });
        const { pathname, innerWidth, innerHeight } = feedbackRecord.user_info;

        window.open(`${pathname}?${getParamsString}`, 'win', `width=${innerWidth},height=${innerHeight}`);
      },
      openJSON(row) {
        this.json = JSON.parse(row.state);
      },
      closeModal() {
        this.json = null;
      },
    },
  };
</script>

<template>
  <div class="feedback-list">
    <modal v-if="!!json" ref="modal" :show="!!json" @close="closeModal">
      <tree-view :data="json" :options="{ maxDepth: 1 }" />
    </modal>

    <sortable-table
      namespace="feedback/table"
      border
      reset-on-destroy
      :default-sort="{prop: 'created_at', order: 'descending'}"
      style="width: 100%">
      <el-table-column
        prop="created_at"
        label="Date"
        sortable
      />
      <el-table-column
        prop="user_data.email"
        label="User"
      />
      <el-table-column
        prop="user_info.pathname"
        label="URI"
      />
      <el-table-column
        prop="message"
        label="Message"
      />
      <el-table-column
        prop=""
        label="Notes">
        <template slot-scope="scope">
          <p v-for="note in scope.row.notes">- {{ note.message }}</p>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="State JSON">
        <template slot-scope="scope">
          <button-el @click="openJSON(scope.row)">Open JSON</button-el>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="Screenshot">
        <template slot-scope="scope">
          <button-el v-if="scope.row.screenshot_data"
                     @click="navigateToScreenShot(scope.row)">Open screenshot</button-el>
        </template>
      </el-table-column>
      <el-table-column
        prop="address"
        label="App State">
        <template slot-scope="scope">
          <button-el @click="viewApp(scope.row)">View app state</button-el>
        </template>
      </el-table-column>
    </sortable-table>
  </div>
</template>

<style scoped>
  .feedback-list {

  }
</style>
