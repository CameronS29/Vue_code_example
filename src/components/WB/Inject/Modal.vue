<script>
  import { mapGetters, mapState, mapActions } from 'vuex';

  import Modal from 'Common/Modal.vue';
  import VerticalForm from "Common/Form/VerticalForm.vue";
  import Group from "Common/Form/Group.vue";
  import GroupSplit from "Common/Form/GroupSplit.vue";
  import NumberField from "Common/Form/Fields/NumberField.vue";

  import ArmField from './ArmField.vue';
  import FuelLoadField from './FuelLoadField.vue';
  import EnvelopeField from './EnvelopeField.vue';

  export default {
    components: {
      Modal,
      VerticalForm,
      Group,
      GroupSplit,
      ArmField,
      FuelLoadField,
      EnvelopeField,
      NumberField,
    },

    computed: {
      ...mapState('wb/aircraft-params', ['activeAircraftTypeId', 'activeAircraftId']),
      ...mapGetters('wb/aircraft-params', ['arms', 'fuelLoads', 'envelopes', 'showModal']),
    },

    methods: {
      ...mapActions('wb/aircraft-params', [
        'setActiveAircraftTypeId',
        'setActiveAircraftId',
        'extractArms',
        'addFuelLoad',
        'addEnvelope',
      ]),

      handleClose() {
        this.setActiveAircraftTypeId(null);
        this.setActiveAircraftId({ aircraftId: null });
      },

      handleAddFuelLoadClick() {
        return this.addFuelLoad()
          .catch(() => this.$notify.error({
            title: 'Error',
            message: 'Something went wrong!'
          }));
      },

      handleExtractArmsClick() {
        return this.extractArms()
          .catch(() => this.$notify.error({
            title: 'Error',
            message: 'Something went wrong!'
          }));
      },

      handleAddEnvelopeClick() {
        return this.addEnvelope()
          .catch(() => this.$notify.error({
            title: 'Error',
            message: 'Something went wrong!'
          }));
      },
    },
  };
</script>

<template>
  <modal :show="showModal" :portalled="false" @close="handleClose">
    <div class="wb-admin-ac-forms">
      <div class="wb-admin-ac-forms__column wb-admin-ac-forms__arms">
        <h2 class="wb-admin-ac-forms__header">Stations</h2>
        <table v-if="arms.length > 0">
          <thead>
          <tr>
            <th>Descriptor</th>
            <th>Arm</th>
          </tr>
          </thead>

          <tbody>
          <arm-field :arm="arm" :key="arm.id" v-for="arm in arms" />
          </tbody>
        </table>
        <p v-else>
          There's no custom stations for the aircraft. <br>
          Click "Extract Arms" to create custom stations from Aircraft Type.
        </p>

        <div class="wb-admin-ac-forms__add-new"
             v-if="activeAircraftId !== null && arms.length === 0">
          <el-button
            @click="handleExtractArmsClick"
            type="primary"
            icon="el-icon-plus"
            size="mini"
          >Extract Arms</el-button>
        </div>
      </div>

      <div class="wb-admin-ac-forms__column wb-admin-ac-forms__fuel-loads"
           v-if="activeAircraftId === null">
        <h2 class="wb-admin-ac-forms__header">Fuel moment</h2>
        <table>
          <thead>
          <tr>
            <th>Weight</th>
            <th>Moment</th>
            <th>&nbsp;</th>
          </tr>
          </thead>

          <tbody>
          <fuel-load-field :fuelLoad="fuelLoad" :key="fuelLoad.id" v-for="fuelLoad in fuelLoads" />
          </tbody>
        </table>

        <div class="wb-admin-ac-forms__add-new">
          <el-button
            @click="handleAddFuelLoadClick"
            type="primary"
            icon="el-icon-plus"
            size="mini"
          >Add</el-button>
        </div>
      </div>

      <div class="wb-admin-ac-forms__column wb-admin-ac-forms__envelope"
           v-if="activeAircraftId === null">
        <h2 class="wb-admin-ac-forms__header">Envelope</h2>
        <table>
          <thead>
          <tr>
            <th>Weight</th>
            <th>CG</th>
            <th>Trim</th>
            <th>Zero Fuel</th>
            <th>&nbsp;</th>
          </tr>
          </thead>

          <tbody>
          <envelope-field :envelope="envelope" :key="envelope.id" v-for="envelope in envelopes" />
          </tbody>
        </table>

        <div class="wb-admin-ac-forms__add-new">
          <el-button
            @click="handleAddEnvelopeClick"
            type="primary"
            icon="el-icon-plus"
            size="mini"
          >Add</el-button>
        </div>
      </div>

    </div>
  </modal>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .wb-admin-ac-forms {
    display: flex;
    padding: 5px 10px;
    align-items: flex-start;

    &__column {
      display: flex;
      flex-flow: column;
      padding: 0 0 0 20px;
      border-left: 1px solid #e0e0e0;

      &:first-child {
        padding-left: 0;
        border-left: none;
      }
    }

    &__arms {
      flex: 1 1;
    }

    &__fuel-loads {
      flex: 2 2;
      margin: 0 20px;
    }

    &__envelope {
      flex: 3 3;
    }

    &__header {
      flex: 1 1;
      font-weight: bold;
      margin-bottom: 15px;
    }

    &__add-new {
      flex: 1 1;
      margin: 10px 25px 20px 0;
    }
  }
</style>
