<script>
  import { Tooltip } from 'element-ui';

  export default {
    props: {
      title: String,
      icon: String,
    },

    components: {
      Tooltip,
    },
  };
</script>

<template>
  <span>
    <tooltip :content="title" class="passengers-sort-button_desktop-tooltip">
      <button @click="$emit('click')" class="passengers-sort-button" v-bind="$attrs">
        <i :class="['fa', `fa-${icon}`]" aria-hidden="true"></i>
      </button>
    </tooltip>

    <button
      class="passengers-sort-button passengers-sort-button_mobile"
      @click="$emit('click')"
      v-bind="$attrs"
    >
      <i :class="['fa', `fa-${icon}`]" aria-hidden="true"></i>
      <span class="passenger-sort-button__sort-description">
        Heavy to Light Sort Passengers
      </span>
    </button>
  </span>
</template>

<style lang="scss">
  @import '../../../../../../scss/bs-variables';

  .passengers-sort-button {
    color: #fff;
    background: #475a68;
    border-radius: 2px;
    border: 1px solid darken(#475a68, 5%);
    padding: 6px 12px;
    display: block;
    width: 100%;

    &_desktop-tooltip {
      display: none;
    }

    &_mobile {
      display: block;
    }
  }


  @media screen and (min-width: $screen-md-min) {
    .passengers-sort-button {
      padding: 3px 6px;

      &_desktop-tooltip {
        display: inherit;
      }

      &_mobile {
        display: none;
      }
    }
  }
</style>
