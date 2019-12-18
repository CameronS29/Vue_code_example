<script>
  import { mapActions, mapGetters, mapState } from 'vuex';

  export default {
    props: {
      pair: {
        type: Object,
        required: true,
      },
    },
    created() {
      if (!this.pilots.length) {
        this.getPilots();
      }
    },
    computed: {
      ...mapGetters('pilots', ['pilots', 'pilotById']),
      sortedFlights() {
        return this.pair.flights.sort();
      },
      pic() {
        return this.pilotById(this.pair.pic);
      },
      sic() {
        return this.pilotById(this.pair.sic);
      },
    },
    methods: {
      ...mapActions('pilots', ['getPilots']),
    }
  };
</script>

<template>
  <div class="linked-pair">
    <div class="linked-pair__name">{{ pair.name }}</div>
    <div class="linked-pair__flights">
      <el-tag type="info" size="mini" :key="flight" v-for="flight in sortedFlights">{{ flight }}</el-tag>
    </div>
    <div class="linked-pair__base">
      <el-tag size="mini" v-if="pair.base">
        <strong>{{ pair.base }}</strong>
        <span v-if="pair.station">({{ pair.station }})</span>
      </el-tag>
    </div>
    <div class="linked-pair__pilots" v-if="pair.pic || pair.sic">
      <span v-if="pair.pic"><strong>PIC:</strong> {{ pic | fullName }}</span>
      <span v-if="pair.sic"><strong>SIC:</strong> {{ sic | fullName }}</span>
    </div>
  </div>
</template>


<style lang="scss">
  .linked-pair {
    display: flex;
    align-items: center;

    > *:not(:last-child) {
      margin-right: 10px;
    }

    &__name {

    }

    &__flights {
      > *:not(:last-child) {
        margin-right: 5px;
      }
    }

    &__pilots {
      display: flex;
      flex-flow: column;
    }
  }
</style>
