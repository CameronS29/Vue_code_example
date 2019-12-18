<script>
  import GenericCommunity from './GenericCommunity.vue';
  import dateOffsetMixin from './dateOffsetMixin';

  export default {
    name: 'Weekly',
    mixins: [dateOffsetMixin(7)],
    components: {
      GenericCommunity,
    },
  };
</script>

<template>
  <generic-community
    :date-from="dateFrom"
    :date-to="dateTo"
    :time-zone="timeZone"
    @tz-change="setTimeZone"
    title="Last 7 Days"
  />
</template>

