<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';

  import { TOGGLE_AIRCRAFT_TYPE_DIALOG, SET_SELECTED_FLIGHT_IDS } from 'store/modules/dispatch/flight-list';
  import AircraftType from 'Common/Form/Fields/AircraftType.vue';

  export default {
    data() {
      return {
        selectedType: null,
      };
    },
    components: {
      AircraftType,
    },
    computed: {
      ...mapState('dispatch/flight-list', ['isChangeAircraftTypeDialogActive']),
      isActive: {
        get() {
          return !!this.isChangeAircraftTypeDialogActive;
        },
        set(value) {
          this[TOGGLE_AIRCRAFT_TYPE_DIALOG](value);
        },
      },
    },
    methods: {
      ...mapMutations('dispatch/flight-list', [TOGGLE_AIRCRAFT_TYPE_DIALOG, SET_SELECTED_FLIGHT_IDS]),
      ...mapActions('dispatch/flight-list', ['setAircraftType']),
      async handleSubmit() {
        this.setAircraftType(this.selectedType);

        this[TOGGLE_AIRCRAFT_TYPE_DIALOG](false);
        this[SET_SELECTED_FLIGHT_IDS]([]);
        this.$emit('submit');
      },
    },
    watch: {
      isChangeAircraftTypeDialogActive(value) {
        if (value) this.selectedType = null;
      },
    },
  };
</script>

<template>
  <el-dialog title="Change Aircraft Type" :visible.sync="isActive">
    <div class="change-aircraft-type">

      <div class="change-aircraft-type__controls">
        <aircraft-type v-model="selectedType" :control-props="{ placeholder: 'Select aircraft type' }" />
        <el-button class="change-aircraft-type__submit" :disabled="!selectedType" @click="handleSubmit"
                   type="primary" size="small">Submit</el-button>
      </div>
    </div>
  </el-dialog>
</template>


<style lang="scss">
  .change-aircraft-type {
    min-width: 300px;

    &__controls {
      display: flex;
      justify-content: flex-end;
    }

    &__submit {
      margin-left: 10px;
    }
  }
</style>
