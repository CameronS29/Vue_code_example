<script>
  import {mapGetters, mapActions} from 'vuex';
  import {DateTime} from 'luxon';
  import Modal from '../../../../Common/Modal.vue';
  import Card from '../../../../Common/Card.vue';
  import ButtonEl from '../../../../Common/Button.vue';

  export default {
    components: {
      Modal,
      Card,
      ButtonEl,
    },

    computed: {
      ...mapGetters('flightlog/complete', [
        'log',
        'isLoaded',
      ]),

      isShown() {
        return !!this.log.id
      },

      icon() {
        return (!this.isLoaded
          ? {glyph: 'circle-o-notch', spin: true, fixedWidth: true}
          : null);
      }
    },

    methods: {
      ...mapActions('flightlog/complete', [
        'completeLog',
        'reset',
      ]),
    },
  };
</script>

<template>
  <modal :show="isShown" @close="reset" :show-close="true" transparent>
    <card mode="dark manifest-complete" v-if="isShown">
      <h2>
        FlIGHT LOG
      </h2>
      <h2>FLIGHT MANIFEST #{{log.manifest.number}}</h2>
      <h2>{{ log.manifest.tail_number }}</h2>
      <div style="color: #d1dade;font-size: 15px; text-align: left;">
        <h3>Crew information</h3>
        Date: {{ log.manifest.created_on }}<br>
        PIC: {{ log.manifest.pic_name }}<br>
        SIC: {{ log.manifest.sic_name }}<br>
        Number of pilots: {{ log.manifest.number_of_pilots }}<br>
        Name of reporting pilot: {{log.manifest.created_by_profile_name }}
        <hr>

        <h3>Flight information</h3>
        Aircraft tail number: {{ log.manifest.tail_number }}<br>
        Aircraft type: {{ log.manifest.aircraft_type }}<br>
        Type of operation (part 91/135): {{ log.flight.operating_under }}<br>
        Flight number: {{ log.flight.flight_number }}<br>
        <br>
        Type of operations: {{ log.manifest.op_type_name }}<br>
        <br>
        Origin: {{ log.flight.origin }}<br>
        Destination: {{ log.flight.destination }}<br>
        <br>
        Scheduled Depature Date/time: {{ log.flight.scheduled_departure|longDT }} UTC<br>
        Scheduled Arrival Date/time: {{ log.flight.scheduled_arrival|longDT }} UTC
        <hr>

        <h3>Pilot input</h3>
        Number of passengers on board: {{ log.number_of_passengers }}<br>
        <br>
        Actual date/time OUT: {{ log.actual_datetime_out|longDT }} UTC<br>
        Actual date/time OFF: {{ log.actual_datetime_off|longDT }} UTC<br>
        Actual date/time ON: {{ log.actual_datetime_on|longDT }} UTC<br>
        Actual date/time IN: {{ log.actual_datetime_in|longDT }} UTC<br>
        <br>
        Flight time: {{ log.flight_time }}<br>
        Block time: {{ log.block_time }}<br>
        <br>
        Night Flight time: {{log.night_flight_time }}<br>
        Instrument Flight time: {{log.instrument_flight_time }}<br>
        <br>
        Initial HOBBS: {{log.initial_hobbs }}<br>
        Final HOBBS: {{log.final_hobbs }}<br>
        <br>
        Fuel Burn: {{log.fuel_burn}}<br>
        <br>
        Number of take-offs (day): {{ log.number_of_takeoffs_day }}<br>
        Number of take-offs (night): {{ log.number_of_takeoffs_night }}<br>
        Number of landings (day): {{ log.number_of_landings_day }}<br>
        Number of landings (night): {{ log.number_of_landings_night }}<br>
        <br>
        Total number of landings: {{ log.number_of_landings_night + log.number_of_landings_day }}<br>
        <br>
        Approach type: {{log.approach}}<br>
        <br>
        Delay type (if any): {{log.delay}}<br>
        <br>
        Comments: {{log.comments}}
      </div>

      <div class="manifest-complete__buttons">
        <button-el
          @click="reset"
          class="manifest-complete__cancel"
          label="Cancel" type="success"
          :disabled="!isLoaded"
          rounded
        />
        <button-el
          @click="completeLog"
          label="Complete"
          type="danger"
          :icon="icon"
          :disabled="!isLoaded"
          rounded
        />
      </div>
    </card>
  </modal>
</template>

<style lang="scss">
  .manifest-complete {
    padding: 15px;
    min-width: 500px;
    &__buttons {
      display: flex;
      justify-content: flex-end;
      padding: 0 10px 10px;
    }

    &__cancel {
      margin-right: 20px;
    }
  }
</style>
