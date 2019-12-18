<script>
  import {mapGetters, mapActions} from 'vuex';

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
      ...mapGetters('flightlog/delete', [
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
      ...mapActions('flightlog/delete', [
        'deleteLog',
        'reset',
      ]),
    },
  };
</script>

<template>
  <modal :show="isShown" @close="reset" :show-close="false" transparent>
    <card mode="dark">
      <h3 class="manifest-delete__alert">
        Are you sure you want to delete this Flight Log?
      </h3>

      <div class="manifest-delete__buttons">
        <button-el
          @click="reset"
          class="manifest-delete__cancel"
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
  .manifest-delete {
    &__alert {
      margin: 20px 10px;
      max-width: 270px;
      text-align: center;
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
