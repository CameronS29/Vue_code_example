<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'BaseRecord',
    computed: mapGetters('scheduling/revisions', ['activePublished']),
  };
</script>

<template>
  <div class="calendar-block__record"
       @click="e => $emit('click', e)"
       :class="{'calendar-block__record_clickable': !activePublished}">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
  .calendar-block {
    &__record {
      margin: 2px;
      text-align: center;
      border-radius: 2px;
      line-height: 19px;
      font-size: 11px;
      cursor: pointer;
      height: 19px;
      user-select: none;
      overflow: hidden;

      &_clickable {
        cursor: pointer;
      }
    }
  }
</style>
