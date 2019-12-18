<script>
  export default {
    name: 'TotalsHeaderItem',

    props: {
      title: String,
      description: String,
    },
  };
</script>

<template>
  <el-tooltip effect="light" :content="description" placement="top">
    <div class="column">{{ title }}</div>
  </el-tooltip>
</template>
