<script>
  import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
  import { DateTime } from 'luxon';

  import { LUXON_US_DATE_FORMAT } from 'store/modules/scheduling/consts';
  import Group from 'Common/Form/Group.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import NumberField from 'Common/Form/Fields/NumberField.vue';
  import TextAreaField from 'Common/Form/Fields/TextAreaField.vue';
  import AircraftType from 'Common/Form/Fields/AircraftType.vue';
  import UserField from 'Common/Form/Fields/UserField.vue';
  import DateField from 'Common/Form/Fields/DateField.vue';
  import GroupSplit from "../../Common/Form/GroupSplit.vue";
  import { required, requiredIf } from 'vuelidate/lib/validators';

  const prop = name => ({
    get() {
      return this.item[name];
    },
    set(value) {
      this.item = {
        ...this.item,
        [name]: value,
      };
    },
  });

  export default {
    props: {
      elementProps: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        item: {},
      };
    },
    components: {
      Group,
      GroupSplit,
      TextField,
      NumberField,
      TextAreaField,
      AircraftType,
      UserField,
      DateField,
    },
    computed: {
      ...mapGetters('user', ['user']),
      ...mapState('aircraft/discrepancy', ['completeDiscrepancy']),
      ...mapGetters('aircraft/mel', ['MEL']),
      ...mapState('aircraft/mel', ['categories']),
      ...mapGetters('wb', [
        'availableAircrafts',
      ]),
      active: {
        get() {
          return !!this.completeDiscrepancy;
        },
        async set() {
          this.$v.$reset();
          this.setCompleteDiscrepancy(null);
        },
      },

      nonDeferrable() {
        return !this.deferrable;
      },
      corrective_action: prop('corrective_action'),
      released_by: prop('released_by'),
      resolution_date: prop('resolution_date'),
    },
    methods: {
      ...mapActions('aircraft/discrepancy', ['updateDiscrepancy']),
      ...mapMutations('aircraft/discrepancy', ['setCompleteDiscrepancy']),
      ...mapActions('aircraft/mel', ['fetchMEL']),
      ...mapActions('wb', ['getAllOptions']),

      async submit() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        await this.updateDiscrepancy({ ...this.item, resolved: true });
        this.active = false;
      },
    },
    created() {
      if (!this.MEL.length) this.fetchMEL();
    },
    validations: {
      released_by: { required },
      corrective_action: { required },
      resolution_date: { required },
    },
    watch: {
      completeDiscrepancy(value) {
        if (!value) return;

        const { id, released_by, resolution_date, corrective_action } = value;
        this.item = {
          id,
          released_by: released_by || this.user.id,
          resolution_date: resolution_date
            ? DateTime.fromFormat(resolution_date, LUXON_US_DATE_FORMAT).toISODate()
            : DateTime.utc().toISODate(),
          corrective_action,
        };
      },
    },
  };
</script>

<template>
  <el-dialog :visible.sync="active" title="Record corrective action" class="discrepancy-modal">
    <div class="discrepancy-modal__corrective-description" v-if="completeDiscrepancy">
      You're about to complete {{ completeDiscrepancy.aircraft_info.registration }} discrepancy.
      <span v-if="completeDiscrepancy.deferrable">
        Deferrable.
      </span>
      <span v-else>
        MEL item {{ completeDiscrepancy.ref_info.code }} ({{ completeDiscrepancy.ref_info.description }}).
      </span>
      <span>
        {{ completeDiscrepancy.description }}
      </span>
    </div>
    <group-split>
      <group label="Actual resolution date" :validation-data="$v.resolution_date">
        <date-field v-model="resolution_date"/>
      </group>
      <group label="Released by" :validation-data="$v.released_by">
        <user-field :control-props="{ multiple: false, filterable: true }" v-model="released_by"/>
      </group>
    </group-split>

    <group label="Corrective Action" :validation-data="$v.corrective_action">
      <text-area-field v-model="corrective_action"/>
    </group>
    <div class="discrepancy-modal__btns">
      <el-button @click="submit" type="primary" >Release</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss">
  @import "../../../../scss/bs-variables";

  .discrepancy-modal {
    &__btns {
      display: flex;
      padding: 10px 20px;

      .el-button {
        width: 100%;
      }
    }

    &__corrective-description {
      background: transparentize($red, .8);
      color: $red;
      padding: 10px 15px;
      margin-bottom: 10px;
    }

    .el-dialog__body {
      padding: 0;
      width: 520px;
    }

    .el-select {
      width: 100%;
    }
  }
</style>
