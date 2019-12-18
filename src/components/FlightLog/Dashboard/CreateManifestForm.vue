<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import { UPDATE_MANIFEST } from '../../../store/modules/pilotManifest/consts';
  import { DateTime } from 'luxon';
  import {
    mapFormIntField,
  } from '../../../store/helpers/forms';

  import Collapse from '../../Common/Collapse.vue';
  import Selectize from '../../fields/Selectize.vue';
  import VerticalForm from "../../Common/Form/VerticalForm.vue";
  import Group from "../../Common/Form/Group.vue";
  import GroupSplit from "../../Common/Form/GroupSplit.vue";
  import { required, requiredIf } from 'vuelidate/lib/validators';

  export default {
    data() {
      return {
        pending: false,
      };
    },
    components: {
      Collapse,
      VerticalForm,
      Group,
      GroupSplit,
      Selectize
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'manifest',
        'availableSICPilots',
        'availablePICPilots',
      ]),
      ...mapGetters('wb', [
        'activeAircrafts',
      ]),
      ...mapGetters('user', [
        'user',
      ]),
      ...mapFormIntField("pilotManifest/manifest", "pilotManifest/" + UPDATE_MANIFEST, [
        "aircraft",
        "pic_profile",
        "sic_profile",
      ]),
    },
    validations() {
      return {
        aircraft: { required },
        pic_profile: { required },
      };
    },
    validationMessages: {},
    methods: {
      ...mapActions('pilotManifest', [
        'pushManifest',
        'reset',
        'getAvailableProfiles',
      ]),
      ...mapActions('wb', [
        'getAllOptions',

      ]),
      ...mapMutations('pilotManifest', [
        UPDATE_MANIFEST,
      ]),
      create() {
        this.$v.$touch();
        if (!this.$v.$error) {
          this.pending = true;
          this[UPDATE_MANIFEST]({
            created_by_profile: (this.user.is_pic || this.user.is_sic) ?
              this.user.profile_id : null,
            created_on: DateTime.utc().toFormat("yyyy-MM-dd")
          });
          this.pushManifest()
          .then(() => this.$router.push({
            name: 'pilot_manifest_edit',
            params: { id: this.manifest.id },
          }))
          .finally(() => {
            this.pending = false;
          })
          .catch(() => this.$notify({
            type: 'error',
            title: 'Cannot create new manifest',
            message: 'Check your network connection or try again later',
          }));
        }
      },
    },
    created() {
      if (this.activeAircrafts.length == 0) {
        this.getAllOptions();
      }

      if (this.availablePICPilots.length == 0) {
        this.getAvailableProfiles();
      }
      this.reset();

      if (this.user.is_pic) {
        this.pic_profile = this.user.profile_id;
      } else if (this.user.is_sic) {
        this.sic_profile = this.user.profile_id;
      }
    }
  };
</script>

<template>
  <collapse title="Create New Manifest" class="create-manifest">
    <vertical-form>
      <group-split class="create-manifest__group-wrapper">
        <group label="Aircraft" :validation-data="$v.aircraft" v-loading="activeAircrafts.length === 0">
          <selectize class="create-manifest__selectize" :items="activeAircrafts" label="Aircraft" :minimal="true"
                     v-model="aircraft" field="registration">
          </selectize>
        </group>

        <group label="PIC" :validation-data="$v.pic_profile" v-loading="availablePICPilots.length === 0">
          <selectize class="create-manifest__selectize" :items="availablePICPilots" label="PIC" :minimal="true" sort="name"
                     v-model="pic_profile" field="name">
          </selectize>
        </group>

        <group label="SIC" :validation-data="$v.sic_profile" v-loading="availableSICPilots.length === 0">
          <selectize class="create-manifest__selectize" :items="availableSICPilots" label="SIC" :minimal="true" sort="name"
                     v-model="sic_profile" field="name">
          </selectize>
        </group>

        <group>
          <button
            @click="create"
            class="btn btn-wide btn-rounded btn-primary create-manifest__submit-btn"
            :disabled="pending"
          >
            Create &nbsp;&nbsp;
            <i class="fa fa-plus" v-if="!pending"></i>
            <i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw" v-else></i>
          </button>
        </group>
      </group-split>
    </vertical-form>
  </collapse>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .create-manifest {
    &__group-wrapper {
      display: flex;
      flex-flow: row wrap;
      align-items: flex-end;
    }
    &__selectize {
      min-width: 210px;
    }
    &__submit-btn {
      @media screen and (max-width: $screen-xs-max) {
        width: 100%;
        margin-top: 15px;
      }
    }
  }
</style>
