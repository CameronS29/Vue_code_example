<script>
  import { mapActions } from 'vuex';

  import { ButtonGroup, Button } from 'element-ui';
  import Block from 'Common/Block.vue';

  import Plain from './ReportTypes/Plain.vue';
  import Yesterday from './ReportTypes/Yesterday.vue';
  import Weekly from './ReportTypes/Weekly.vue';
  import Custom from './ReportTypes/Custom.vue';

  import { queryParam } from '../../../utils/routers';
  import ViewPortal from 'Common/ViewPortal.vue';

  export default {
    name: 'OnTime',

    components: {
      ViewPortal,
      Block,
      ButtonEl: Button,
      ButtonGroup,
      Plain,
      Yesterday,
      Weekly,
      Custom,
    },

    created() {
      this.getFilters();
    },

    computed: {
      reportType: queryParam({
        param: 'report_type',
        defaultValue: 'plain',
      }),

      reportComponents() {
        return {
          plain: 'Plain',
          yesterday: 'Yesterday',
          week: 'Weekly',
          custom: 'Custom',
        };
      },

      reportTitles() {
        return {
          plain: 'Plain',
          yesterday: 'Yesterday',
          week: 'Last 7 Days',
          custom: 'Custom Range',
        };
      },
    },

    methods: {
      ...mapActions('reports/onTime', ['getFilters']),

      setType(reportType) {
        const { query } = this.$route;
        this.$router.push({
          query: {
            ...(reportType !== 'plain' ? query : {}),
            report_type: reportType,
          },
        });
      },
    },
  };
</script>

<template>
    <block title="On-Time Performance">
      <view-portal to="header">
        <button-group class="on-time-report__types">
          <button-el
            v-for="type in Object.keys(reportComponents)"
            :key="type"
            @click="setType(type)"
            :disabled="reportType === type"
            type="primary"
            size="small"
          >{{ reportTitles[type] }}</button-el>
        </button-group>
      </view-portal>
      <component :is="reportComponents[reportType]" />
    </block>
</template>
