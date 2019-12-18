<script>
  import { mapState } from 'vuex';
  import calcValuesMixin from '../../mixins/calcValuesMixin';
  import Alert from '../../../../Common/Alert.vue';

  export default {
    mixins: [calcValuesMixin],

    components: {
      Alert,
    },

    computed: {
      ...mapState('wb/passenger', ['passengers']),

      showWarning() {
        return false;
        // return (
        //   !this.isValid
        //   && this.isLoaded
        //   && this.passengers.length > 0
        // );
      },
    },
  };
</script>

<template>
  <transition name="wb-passengers-warning">
    <alert type="warning" v-if="showWarning">
      Passengers are required to sit in specific seats for this flight.
    </alert>
  </transition>
</template>

<style lang="scss">
  .wb-passengers-warning {
    &-enter,
    &-leave-to {
      opacity: 0;
    }

    &-enter-to,
    &-leave {
      opacity: 1;
    }

    &-enter-active {
      transition: opacity 200ms ease-in;
    }

    &-leave-active {
      transition: opacity 200ms ease-out;
    }
  }
</style>
