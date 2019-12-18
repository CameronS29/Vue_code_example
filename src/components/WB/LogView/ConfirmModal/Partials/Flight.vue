<script>
  import { mapGetters } from 'vuex';
  import Card from 'Common/Card.vue';

  export default {
    name: 'Flight',

    components: { Card },

    computed: mapGetters('wb', [
      'selectedFlightNumber',
      'selectedDeparture',
      'selectedArrival',
      'selectedDate',
      'selectedAircraft',
    ]),
  };
</script>

<template>
  <card :title="`Flight ${selectedFlightNumber ? `#${selectedFlightNumber}` : '—' }`">
    <div class="wb-confirm-flight">
      <div class="wb-confirm-flight__field">
        <span class="wb-confirm-flight__label">Date</span>
        <span class="wb-confirm-flight__value">{{ selectedDate || '—' }}</span>
      </div>

      <div class="wb-confirm-flight__field">
        <span class="wb-confirm-flight__label">Aircraft</span>
        <span class="wb-confirm-flight__value">{{ selectedAircraft && selectedAircraft.registration || '—' }}</span>
      </div>

      <div class="wb-confirm-flight__field">
        <span class="wb-confirm-flight__label">Origin</span>
        <span class="wb-confirm-flight__value">{{ selectedDeparture || '—' }}</span>
      </div>

      <div class="wb-confirm-flight__field">
        <span class="wb-confirm-flight__label">Destination</span>
        <span class="wb-confirm-flight__value">{{ selectedArrival || '—' }}</span>
      </div>
    </div>
  </card>
</template>

<style lang="scss" scoped>
  .wb-confirm-flight {
    display: flex;
    flex-direction: column;

    &__field {
      display: flex;
      flex-flow: row nowrap;
    }

    &__label,
    &__value {
      flex: 1 1 50%;
    }

    &__value {
      font-weight: bold;
    }
  }
</style>
