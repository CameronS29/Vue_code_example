<script>
  import FlightBadge from './FlightBadge.vue';

  export default {
    components: {
      FlightBadge,
    },

    props: {
      pair: {
        type: Object,
        required: true,
      },
      timezone: {
        type: [Boolean, String, Object],
        default: false,
      },
    },
  };
</script>

<template>
  <div class="pair-badge">
    <div class="pair-badge__name">
      {{ pair.name }}
    </div>
    <div class="pair-badge__flights">
      <flight-badge :key="flight.id" :flight="flight" :timezone="timezone" v-for="flight in pair.flights" />
    </div>
  </div>
</template>

<style lang="scss">
  .pair-badge {
    margin-right: 15px;
    padding: 3px 10px;
    background-color: #f3f3f4d4;
    border-radius: 3px;
    &__name {
      font-weight: bold;
      margin-bottom: 2px;
      margin-left: 2px;
    }
    &__flights {
      display: flex;
      > *:last-child {
        margin-right: 0;
      }
    }
  }
</style>
