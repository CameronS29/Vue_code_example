<script>
  import { mapGetters } from 'vuex';

  export default {
    computed: {
      ...mapGetters('wb', [
        'selectedAircraft',
        'selectedAircraftType',
      ]),
    },
  };
</script>

<template>
  <div class="panel panel-body wb-aircraft" v-if="selectedAircraft">
    <div class="ac-table">
      <div class="ac-label">Max. Takeoff Weight</div>
      <div class="ac-value">{{ selectedAircraftType.mtow }}</div>
    </div>
    <div class="ac-table">
      <div class="ac-label">Basic Empty Weight</div>
      <div class="ac-value">{{ selectedAircraft.bew }}</div>
    </div>
    <div class="ac-table">
      <div class="ac-label">CG</div>
      <div class="ac-value">{{ selectedAircraft.bew_cg }}</div>
    </div>
  </div>
</template>

<style lang="scss">
  .ac-table{
    display: flex;
    flex-flow: row nowrap;
    margin-bottom: 10px;

    @media (max-width: 309px) {
      .ac-label, .ac-value {
        font-size: 13px;
      }
    }

    .ac-label {
      flex: 1 0;
      margin-right: 10px;
      font-weight: bold;
      font-size: 15px;
    }

    .ac-value {
      flex: 0 1;
      font-size: 16px;
    }
  }
</style>
