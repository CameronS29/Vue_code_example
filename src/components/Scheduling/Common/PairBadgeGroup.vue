<script>
  import PairBadge from './PairBadge.vue';

  export default {
    components: {
      PairBadge,
    },

    props: {
      group: {
        type: Array,
        required: true,
      },
      timezone: {
        type: [Boolean, String, Object],
        default: false,
      },
      standalone: {
        type: Boolean,
        default: false,
      },
    },

    computed: {
      classes() {
        return {
          'pair-badge-group': true,
          'pair-badge-group_standalone': this.standalone,
        };
      },
    },
  };
</script>

<template>
  <div :class="classes">
    <div class="pair-badge-group__name">
      {{ group[0].base }}
    </div>
    <div class="pair-badge-group__pairs">
      <pair-badge :key="pair.id" :pair="pair" :timezone="timezone" v-for="pair in group" />
    </div>
  </div>
</template>

<style lang="scss">
  .pair-badge-group {
    border-radius: 3px;
    padding-left: 20px;
    position: relative;
    margin-right: 15px;
    margin-bottom: 10px;
    &_standalone {
      flex: 1 1 100%;
      order: -100;
      border-left: 3px solid;
      .pair-badge-group__name {
        font-weight: bold;
      }
    }
    &__name {
      margin-bottom: 2px;
      margin-left: 2px;
      position: absolute;
      left: -5px;
      transform: rotate(-90deg);
      top: 29px;
    }
    &__pairs {
      display: flex;
      flex-flow: row wrap;
      margin-bottom: -10px;
      > *:last-child {
        margin-right: 0;
      }

      .pair-badge {
        margin-bottom: 10px;
      }
    }
  }
</style>
