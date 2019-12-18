<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';

  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import ButtonEl from 'Common/Button.vue';
  import NumberField from "Common/Form/Fields/NumberField.vue";
  import { SET_NUMBER_CHANGE_MODAL } from 'store/modules/pilotManifest/consts';

  export default {
    components: {
      Modal,
      Card,
      ButtonEl,
      NumberField,
    },

    computed: {
      ...mapGetters('pilotManifest', [
        'manifest',
        'activeNumberChangeModal'
      ]),
      icon() {
        return (this.isSaving
          ? {glyph: 'circle-o-notch', spin: true, fixedWidth: true}
          : null);
      }
    },

    methods: {
      ...mapMutations('pilotManifest', [
        SET_NUMBER_CHANGE_MODAL,
      ]),
      ...mapActions('pilotManifest', [
        'updateManifestNumber'
      ]),
      saveManifestNumber() {
        this.isSaving = true;
        this.updateManifestNumber(this.number)
          .then(()=>this.reset())
          .catch((err)=>this.$notify({
            type: 'error',
            title: 'Cannot save new manifest number',
            message: 'Check your network connection or it is duplicated',
          }))
          .finally(()=>{this.isSaving = false});
      },
      reset() {
        this[SET_NUMBER_CHANGE_MODAL](false);
      }
    },
    mounted() {
      this.number = this.manifest.number;
    },
    data() {
      return {
        number: '',
        isSaving: false
      }
    }
  };
</script>

<template>
  <modal :show="activeNumberChangeModal" @close="reset" :show-close="false" transparent>
    <card mode="dark">
      <h2 class="manifest-confirm-modal__title">
        Change Manifest Number
      </h2>
      <number-field v-model="number" class="manifest-number__input" />
      <div class="manifest-number__buttons">
        <button-el
          @click="reset"
          class="manifest-number__cancel"
          label="Cancel" type="success"
          :disabled="isSaving"
          rounded
        />
        <button-el
          @click="saveManifestNumber"
          label="Save"
          type="danger"
          :icon="icon"
          :disabled="isSaving || number == manifest.number"
          rounded
        />
      </div>
    </card>
  </modal>
</template>

<style lang="scss">
  .manifest-number {
    &__input {
      margin: 10px;
      color: black;
      font-size: 16px;
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
