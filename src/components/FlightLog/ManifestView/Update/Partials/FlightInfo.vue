<script>
  import find from 'lodash/find';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import updateManifestMixin, { logProperty, toNumber } from './updateManifestMixin';
  import Collapse from 'Common/Collapse.vue';
  import TextAreaField from 'Common/Form/Fields/TextAreaField.vue';
  import Selectize from '../../../../fields/Selectize.vue';
  import Group from "Common/Form/Group.vue";
  import GroupSplit from "Common/Form/GroupSplit.vue";
  import { required, requiredIf } from 'vuelidate/lib/validators';

  export default {
    mixins: [updateManifestMixin],
    data() {
      return {
        pending: false,
      };
    },
    components: {
      Collapse,
      Group,
      GroupSplit,
      TextAreaField,
      Selectize
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'operations'
      ]),
      ...mapGetters('wb', [
        'availableAircraftTypes',
        'activeAircrafts'
      ]),
      aircraftType() {
        const aircraft = find(
          this.activeAircrafts,
          { id: this.manifest.aircraft }
        );

        if (aircraft) {
          return find(this.availableAircraftTypes, { id: aircraft.type });
        } else {
          return {};
        }
      },
      op_type: logProperty('op_type', toNumber),
      aircraft: logProperty('aircraft', toNumber),
      notes: logProperty('notes'),
    },
    validations: {
      aircraft: { required: requiredIf('validateTryCount') },
      op_type: { required: requiredIf('validateTryCount') },
    },
    methods: {
      ...mapActions('pilotManifest', [
        'getOperations',
      ]),
      ...mapActions('wb', [
        'getAllOptions'
      ]),
    }
  };
</script>

<template>
  <collapse title="Flight Info" :gutterColor="false" class="edit-manifest-flight-info">
    <group-split class="edit-manifest-flight-info__group-split">
      <group class="edit-manifest-flight-info__group" label="Op Type" :validation-data="$v.op_type"
             v-loading="operations.length === 0">
        <selectize :items="operations" :minimal="true" v-model="op_type" field="name"
                   label="Op Type">
        </selectize>
      </group>

      <group class="edit-manifest-flight-info__group" label="Aircraft" :validation-data="$v.aircraft"
             v-loading="activeAircrafts.length === 0">
        <selectize :items="activeAircrafts" label="Aircraft" :minimal="true" v-model="aircraft"
                   field="registration">
        </selectize>
      </group>

      <group class="edit-manifest-flight-info__group" label="Type and Serial">
        {{aircraftType.name}}
      </group>
    </group-split>

    <group label="Notes" :validation-data="$v.notes">
      <text-area-field v-model="notes" />
    </group>

  </collapse>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .edit-manifest-flight-info {
    &__group-split {
      flex-flow: row wrap;
    }
    &__group {
      min-width: 220px;
    }
  }
</style>

