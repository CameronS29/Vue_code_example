<script>
  export default {
    props: ["shrink", "grow"]
  }
</script>
<template>
  <div class="column-flex__column" :class="{'column-flex__column_shrink': shrink, 'column-flex__column_grow': grow}">
    <slot></slot>
  </div>
</template>
