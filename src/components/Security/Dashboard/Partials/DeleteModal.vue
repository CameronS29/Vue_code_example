<script>
  import {mapGetters, mapActions} from 'vuex';

  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import ButtonEl from 'Common/Button.vue';

  export default {
    components: {
      Modal,
      Card,
      ButtonEl,
    },

    computed: {
      ...mapGetters('security/delete', [
        'log',
        'isLoaded',
      ]),

      isShown() {
        return !!this.log.id;
      },

      icon() {
        return (!this.isLoaded
          ? {glyph: 'circle-o-notch', spin: true, fixedWidth: true}
          : null);
      }
    },

    methods: {
      ...mapActions('security/delete', [
        'deleteLog',
        'reset',
      ]),
    },
  };
</script>

<template>
  <modal :show="isShown" @close="reset" :show-close="false" transparent>
    <card mode="dark" class="security-confirm-modal">
      <h2 class="security-confirm-modal__title">
        Are you sure delete this log?
      </h2>
      <p class="security-confirm-modal__alert">
        Recorded Date/Time<br/>
        <strong>{{log.submission_date_local}}</strong>
        <br/><br/>

        Crew Name <br/>
        <strong>{{log.crew_name}}</strong><br/><br/>

        Scheduled Departure Date/Time <br/>
        <strong>{{log.flight_date}}</strong><br/><br/>

        Acutal Departure Date/Time <br/>
        <strong>{{log.actual_datetime_out_local}}</strong><br/><br/>

        Aircraft <br/>
        <strong>{{log.tail_number}}</strong><br/><br/>
      </p>
      <div class="security-confirm-modal__buttons">
        <button-el
          @click="reset"
          class="security-confirm-modal__cancel"
          label="Cancel" type="success"
          :disabled="!isLoaded"
          rounded
        />
        <button-el
          @click="deleteLog"
          label="Delete"
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
  .security-confirm-modal {

    &__alert {
      margin: 20px 10px;
      max-width: 270px;
      text-align: left;
      line-height: 22px;
    }

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
