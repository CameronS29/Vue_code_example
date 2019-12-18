<script>
  import { mapGetters, mapActions } from 'vuex';
  import Card from 'Common/Card.vue';

  export default {
    name: 'Crew',

    components: {
      Card,
    },

    created() {
      this.getAvailablePilots();
      this.getAvailableUsers();
    },

    computed: mapGetters('wb', [
      'availablePilots',
      'selectedPIC',
      'selectedSIC',
      'selectedGSC',
      'log',
    ]),

    methods: mapActions('wb', [
      'getAvailablePilots',
      'getAvailableUsers',
    ]),
  };
</script>

<template>
  <card title="Crew" v-loading="availablePilots.length === 0">
    <table class="wb-confirm-crew__table">
      <thead>
      <tr>
        <th />
        <th />
        <th>Weight</th>
        <th>Gate Bag</th>
      </tr>
      </thead>

      <tbody>
      <tr>
        <th>PIC</th>
        <td>
          <span v-if="selectedPIC">{{ selectedPIC.name || '&ndash;' }}</span>
        </td>
        <td>{{ log.pic_weight || '&ndash;' }}</td>
        <td>{{ log.pic_gate_bag || '&ndash;' }}</td>
      </tr>

      <tr>
        <th>SIC</th>
        <td>
          <span v-if="log.guest_sic">{{ log.guest_sic }}</span>
          <span v-else-if="selectedSIC">{{ selectedSIC.name || '&ndash;' }}</span>
          <span v-else>&ndash;</span>
        </td>
        <td>{{ log.sic_weight || '&ndash;' }}</td>
        <td>{{ log.sic_gate_bag || '&ndash;' }}</td>
      </tr>

      <tr v-if="selectedGSC">
        <th>GSC</th>
        <td>{{ selectedGSC.name }}</td>
        <td colspan="2">&nbsp;</td>
      </tr>
      </tbody>
    </table>
  </card>
</template>

<style lang="scss" scoped>
  .wb-confirm-crew {
    &__table {
      width: 100%;
    }
  }
</style>
