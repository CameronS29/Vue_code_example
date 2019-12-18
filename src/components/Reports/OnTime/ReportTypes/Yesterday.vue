<script>
  import GenericCommunity from './GenericCommunity.vue';
  import dateOffsetMixin from './dateOffsetMixin';

  export default {
    name: 'Yesterday',
    mixins: [dateOffsetMixin(1)],
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
    title="Yesterday"
  />
</template>
