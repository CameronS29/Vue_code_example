<script>
  import find from 'lodash/find';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import updateManifestMixin, { logProperty, toNumber } from './updateManifestMixin';
  import { Row, Col } from 'element-ui';
  import Collapse from 'Common/Collapse.vue';
  import Datepicker from '../../../../fields/Datepicker.vue';
  import SelectField from "../../../../fields/Selectize.vue";
  import Group from "Common/Form/Group.vue";
  import GroupSplit from "Common/Form/GroupSplit.vue";
  import { required, requiredIf } from 'vuelidate/lib/validators';

  function getProfiles(availableProfiles, allProfiles, id) {
    if (availableProfiles.length > 0 && id) {
      if (find(availableProfiles, { id })) {
        return availableProfiles;
      } else {
        return [...availableProfiles, find(allProfiles, { id })];
      }
    }

    return availableProfiles;
  }

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
      SelectField,
      Datepicker,
      ElRow: Row,
      ElCol: Col
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'availableSICPilots',
        'availablePICPilots',
        'availableProfiles',
        'allProfiles',
      ]),
      created_on: logProperty('created_on'),
      created_by_profile: logProperty('created_by_profile', toNumber),
      pic_profile: logProperty('pic_profile', toNumber),
      sic_profile: logProperty('sic_profile', toNumber),
      SICPilots() {
        return getProfiles(this.availableSICPilots, this.allProfiles, this.sic_profile);
      },
      PICPilots() {
        return getProfiles(this.availablePICPilots, this.allProfiles, this.pic_profile);
      },
      revisedProfiles() {
        return getProfiles(this.availableProfiles, this.allProfiles, this.created_by_profile);
      }
    },
    methods: {
      ...mapActions('pilotManifest', [
        'getAvailableProfiles',
      ]),
    },
    // created() {
    //   if (this.availableProfiles.length == 0) {
    //     this.getAvailableProfiles();
    //   }
    // },
    validations() {
      return {
        created_on: { required },
        created_by_profile: { required },
        pic_profile: { required },
      };
    },
    validationMessages: {},
  };
</script>

<template>
  <collapse title="General Info" :gutterColor="false" class="edit-manifest-general-info">
    <el-row class="edit-manifest-general-info__row">
      <group label="Created On" :validation-data="$v.created_on" class="edit-manifest-general-info__group">
        <datepicker v-model="created_on" />
      </group>
      <group label="Created By"
             v-loading="availableProfiles.length === 0"
             class="edit-manifest-general-info__group"
             :validation-data="$v.created_by_profile">
        <select-field :items="revisedProfiles" :minimal="true" v-model="created_by_profile" field="name" label="user">
        </select-field>
      </group>

      <group label="PIC" class="edit-manifest-general-info__group" :validation-data="$v.pic_profile"
             v-loading="availablePICPilots.length === 0">
        <select-field :items="PICPilots" label="PIC" :minimal="true" v-model="pic_profile" field="name">
        </select-field>
      </group>

      <group label="SIC" class="edit-manifest-general-info__group" :validation-data="$v.sic_profile"
             v-loading="availableSICPilots.length === 0">
        <select-field :items="SICPilots" label="SIC" :minimal="true" v-model="sic_profile" field="name">
        </select-field>
      </group>
    </el-row>
  </collapse>
</template>

<style lang="scss">
  .edit-manifest-general-info {
    &__row {
      display: flex;
      flex-flow: row wrap;
    }
    &__group {
      flex: 1 1 25%;
      min-width: 220px;
    }
  }

  .manifest__createBtn {
    margin-bottom: 15px;
  }
</style>
