<script>
  import WbLogs from './WB/List.vue';
  import ManifestLogs from './Manifest/List.vue';

  export default {
    components: {
      WbLogs,
      ManifestLogs
    },
  };
</script>

<template>
  <div>
    <manifest-logs />
    <wb-logs />
  </div>
</template>
