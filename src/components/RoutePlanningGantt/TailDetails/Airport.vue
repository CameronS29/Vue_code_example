<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { find } from 'lodash';

  export default {
    props: {
      airport: {
        type: Object,
        required: true,
      },
      activeFlight: {
        type: [Object, Boolean],
        default: false,
      },
    },
    computed: {
      ...mapState('dispatch/e-checklist', [
        'airportInfoProps',
      ]),
      ...mapGetters('airports', [
        'byId',
      ]),
      serializedAirport() {
        return this.byId(this.airport.id);
      },
      iata() {
        return this.serializedAirport.iata;
      },
      notes() {
        if (!this.serializedAirport.dispatcher_notes) return '–';

        return this.serializedAirport.dispatcher_notes.replace('\n', '<br />');
      },
      classes() {
        if (!this.activeFlight) return false;

        return {
          'airport-detailed_active': [
            this.activeFlight.origin.id,
            this.activeFlight.destination.id,
          ].includes(this.airport.id),
        };
      },
    },
  };
</script>

<template>
  <div class="airport-detailed" :class="classes">
    <div class="airport-detailed__iata" v-if="serializedAirport"><el-tag size="mini">{{ iata }}</el-tag></div>
    <div class="airport-detailed__report-type" v-if="airportInfoProps.metar">
      <div class="airport-detailed__title">METAR</div>
      {{ airport.METAR ? airport.METAR['Raw-Report'] : 'Data load error.' }}
    </div>
    <div class="airport-detailed__report-type" v-if="airportInfoProps.taf">
      <div class="airport-detailed__title">TAF</div>
      {{ airport.TAF ? airport.TAF['Raw-Report'] : 'Data load error.' }}
    </div>
    <div class="airport-detailed__report-type" v-if="serializedAirport && airportInfoProps.notes">
      <div class="airport-detailed__title">Notes</div>
      <div v-html="notes" />
    </div>
    <div class="airport-detailed__report-type" v-if="airportInfoProps.notam">
      <div class="airport-detailed__title">NOTAM</div>
      <div class="airport-detailed__notams" v-if="airport.NOTAM">
        <div class="airport-detailed__notam" v-for="notam in airport.NOTAM.notamList">
          {{ notam.traditionalMessage }}
        </div>
      </div>
      <div v-else>Data load error.</div>
    </div>
  </div>
</template>


<style lang="scss">
  @import '../../../../scss/bs-variables';

  .airport-detailed {
    background: #ECF6F6;
    border-radius: 3px;
    margin-bottom: 5px;
    padding: 5px;
    font-size: 12px;
    position: relative;

    &_active {
      background: transparentize($yellow, .85);
    }

    &__iata {
      position: absolute;
      right: 5px;
      top: 5px;
    }

    &__report-type {
      &:not(:last-of-type) {
        margin-bottom: 10px;
      }
    }

    &__title {
      font-weight: bold;
      line-height: 20px;
    }

    &__notam {
      &:not(:last-of-type) {
        margin-bottom: 5px;
      }
    }
  }
</style>
