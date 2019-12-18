<script>
  export default {
    name: 'Card',

    props: {
      title: String,

      /**
       * Either 'light' or 'dark'
       */
      mode: {
        type: String,
        default: 'light',
      },
    },

    computed: {
      showHeading() {
        return this.$slots.title !== undefined
          || this.title !== undefined;
      },
    },

    methods: {
      prefixedStyle(cls) {
        return [cls, `${cls}_${this.mode}`];
      },
    },
  };
</script>

<template>
  <div :class="prefixedStyle('card')">
    <div v-if="showHeading" :class="prefixedStyle('card__heading')">
      <slot name="title">
        <div class="card__title">{{ title }}</div>
      </slot>
    </div>
    <div class="card__container">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../scss/bs-variables';

  .card {
    margin-bottom: 20px;
    border: 1px solid transparent;
    border-radius: 4px;
    display: flex;
    flex-direction: column;

    &_light {
      background-color: white;
      color: black;
    }

    &_dark {
      background-color: $black;
      color: white;
    }

    &::after {
      display: table;
      content: '';
    }


    &__heading {
      padding: 15px 15px 0;
    }

    &__container {
      padding: 15px;
      flex: 1 1 100%;
    }

    &__title {
      font-size: 1.2em;
      font-weight: bold;
    }
  }

  .modal__content-wrapper > .card {
    margin-bottom: 0;
  }
</style>
