<script>
  import {mapActions, mapGetters, mapState, mapMutations} from "vuex";
  import Icon from "Common/Icon.vue";
  import { DateTime } from "luxon";
  import {SET_FLIGHT} from "../../../../store/modules/flights";
  export default {
    name: "commit",
    components: {
      Icon,
    },
    props: ['commit'],
    computed: {
      classes() {
        return {
          "synced-flight_creation": this.commit.initial && this.commit.active,
          "synced-flight_update": !this.commit.initial && this.commit.active,
          "synced-flight_deletion": !this.commit.active,
          "synced-flight": true
        }
      }
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlightStatuses']),
      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlightStatuses();
      },
    },
    filters: {
      fullDate(date) {
        return DateTime.fromISO(date, {zone: 'utc'}).toFormat("MM/dd/yyyy HH:mm");
      },
    },
  }
</script>
<template>

  <div :class="classes" @click="showDetailView(commit.flight)">
    <div class="synced-flight__flight_number">
      #{{ commit.flight_number }}
    </div>
    <div class="synced-flight__airports">
      {{ commit.origin.iata }}<i class="fa fa-fighter-jet"></i>{{ commit.destination.iata }}
    </div>
    <div class="synced-flight__times">
      {{ commit.scheduled_departure|fullDate }}<i class="fa fa-fighter-jet"></i>{{ commit.scheduled_arrival|fullDate }}
    </div>

  </div>
</template>


<style scoped lang="scss">
  .synced-flight {
    background: #fff;
    padding: 5px 10px;
    margin-bottom: 10px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    color: #737373;
    border-left: 3px solid;
    border-radius: 3px;
    transition: background 200ms ease-in-out;
    margin-right: 10px;
    flex: 0 0 380px;
    &:hover {
      background: #ddd;
      cursor: pointer;
    }
    &__flight_number{
      font-size: 16px;
      margin-right: 5px;
    }
    &__airports {
      margin-right: 5px;
    }
    &_creation {
      border-left-color: #00B792;

    }
    &_update {
      border-left-color: #d6d614;
    }
    &_deletion {
      border-left-color: #d63747;
    }
  }
    .fa {
      color: #dddddd;
      margin: 0 3px;
      display: inline-block;
    }
</style>
