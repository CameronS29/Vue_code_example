<script>
  import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
  import { DateTime } from 'luxon';
  import { find } from 'lodash';

  import { LUXON_US_DATE_FORMAT } from 'store/modules/scheduling/consts';
  import Group from 'Common/Form/Group.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import NumberField from 'Common/Form/Fields/NumberField.vue';
  import TextAreaField from 'Common/Form/Fields/TextAreaField.vue';
  import AircraftType from 'Common/Form/Fields/AircraftType.vue';
  import PilotField from 'Common/Form/Fields/PilotField.vue';
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
      PilotField,
      DateField,
    },
    computed: {
      ...mapState('aircraft/discrepancy', ['currentDiscrepancy']),
      ...mapGetters('aircraft', ['aircraftById']),
      ...mapGetters('aircraft/mel', ['MEL']),
      ...mapState('aircraft/mel', ['categories', 'categoriesDefaultExpiration']),
      ...mapGetters('wb', [
        'availableAircrafts',
      ]),
      active: {
        get() {
          return !!this.currentDiscrepancy;
        },
        async set() {
          this.$v.$reset();
          this.setCurrentDiscrepancy(null);
        },
      },

      pilot: prop('pilot'),
      aircraft: prop('aircraft'),
      ref: prop('ref'),
      deferrable: prop('deferrable'),
      flightdoc_added: prop('flightdoc_added'),
      date_recorded: prop('date_recorded'),
      description: prop('description'),
      control_number: prop('control_number'),
      notes: prop('notes'),

      selectedAircraft() {
        return this.aircraftById(this.aircraft);
      },
      selectedRef() {
        return find(this.MEL, item => item.id === this.ref);
      },
      filteredMEL() {
        if (!this.aircraft) return [];

        return this.MEL.filter(item => item.aircraft_type_name === this.selectedAircraft.type.type);
      },
      MELCategory() {
        return this.categories[this.selectedRef.category];
      },
      expirationDate() {
        return DateTime.fromISO(this.date_recorded)
          .plus({ days: this.selectedRef.expiration })
          .toFormat(LUXON_US_DATE_FORMAT);
      },
    },
    methods: {
      ...mapActions('aircraft/discrepancy', ['updateDiscrepancy']),
      ...mapMutations('aircraft/discrepancy', ['setCurrentDiscrepancy']),
      ...mapActions('aircraft/mel', ['fetchMEL']),
      ...mapActions('wb', ['getAllOptions']),

      async submit() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        await this.updateDiscrepancy(this.item);
        this.active = false;
      },
    },
    created() {
      if (!this.MEL.length) this.fetchMEL();
      if (!this.availableAircrafts.length) {
        this.getAllOptions();
      }
    },
    validations: {
      aircraft: { required },
      pilot: { required },
      date_recorded: { required },
      ref: { requiredIf: requiredIf('deferrable') },
      description: { required },
      control_number: { required },
    },
    watch: {
      currentDiscrepancy(item) {
        this.item = {
          ...item,
          date_recorded: item && item.date_recorded
            ? DateTime.fromFormat(item.date_recorded, LUXON_US_DATE_FORMAT).toISODate()
            : DateTime.utc().toISODate(),
        };
      },
      selectedAircraft(newValue, oldValue) {
        if (newValue && oldValue && newValue.type.type !== oldValue.type.type) {
          this.ref = null;
        }
      },
      deferrable(newValue) {
        if (!newValue) {
          this.ref = null;
          this.expiration = null;
        }
      },
    },
  };
</script>

<template>
  <el-dialog :visible.sync="active" :title="item.id ? 'Edit Discrepancy' : 'Add Discrepancy'" class="discrepancy-modal">
    <group-split>
      <group label="Date Recorded" :validation-data="$v.date_recorded">
        <date-field v-model="date_recorded"/>
      </group>
      <group label="PIC" :validation-data="$v.pilot">
        <pilot-field :control-props="{ multiple: false, filterable: true }" type="PIC" field="user" v-model="pilot"/>
      </group>
    </group-split>
    <group-split>
      <group>
        <el-switch
          style="margin-right: 10px"
          v-model="deferrable"
          active-text="Deferrable" />
        <el-switch
          v-model="flightdoc_added"
          active-text="In FD" />
      </group>
    </group-split>

    <div class="discrepancy-modal__mel-desc" v-if="ref">
      <div class="discrepancy-modal__mel-prop">
        <div class="discrepancy-modal__mel-key">Category</div>
        <div class="discrepancy-modal__mel-value">{{ MELCategory }}</div>
      </div>
      <div class="discrepancy-modal__mel-prop">
        <div class="discrepancy-modal__mel-key">Days until expiration</div>
        <div class="discrepancy-modal__mel-value">{{ selectedRef.expiration }}</div>
      </div>
      <div class="discrepancy-modal__mel-prop">
        <div class="discrepancy-modal__mel-key">Description</div>
        <div class="discrepancy-modal__mel-value">{{ selectedRef.description }}</div>
      </div>
      <div class="discrepancy-modal__mel-prop">
        <div class="discrepancy-modal__mel-key">Operational restrictions</div>
        <div class="discrepancy-modal__mel-value">{{ selectedRef.operational_restrictions }}</div>
      </div>
    </div>
    <div class="discrepancy-modal__due-date" v-if="date_recorded && (ref || !deferrable) ">
      <div v-if="deferrable">
        <span class="discrepancy-modal__due-date-value">{{ expirationDate }}</span> – expiration date
      </div>
      <span class="discrepancy-modal__due-date-value" v-else>GROUNDING</span>
    </div>
    <group-split>
      <group label="Tail number" :validation-data="$v.aircraft" >
        <el-select v-model="aircraft"
                   size="small"
                   class="state-history-filters__select"
                   placeholder="Tail number"
                   filterable
                   clearable>
          <el-option
            v-for="aircraft of availableAircrafts"
            :key="aircraft.id"
            :label="aircraft.registration"
            :value="aircraft.id"
          />
        </el-select>
      </group>
      <group label="MEL Item" :validation-data="$v.ref" v-if="deferrable">
        <el-select
          :disabled="!aircraft"
          v-model="ref"
          size="small"
          v-bind="elementProps"
          filterable
          clearable
        >
          <el-option
            v-for="item in filteredMEL"
            :key="item.id"
            :label="item.code"
            :value="item.id"/>
        </el-select>
      </group>
    </group-split>

    <group label="Control Number" :validation-data="$v.control_number">
      <text-field v-model="control_number"/>
    </group>
    <group label="Description of discrepancy" :validation-data="$v.description">
      <text-area-field v-model="description"/>
    </group>
    <group label="Notes" :validation-data="$v.notes">
      <text-area-field v-model="notes"/>
    </group>
    <div class="discrepancy-modal__btns">
      <el-button @click="submit" type="primary">{{ item.id ? 'Update' : 'Create' }}</el-button>
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

    &__mel-desc {
      background: transparentize($brand-info, .9);
      display: grid;
      grid-template-columns: repeat(2, 1fr);

    }

    &__mel-prop {
      padding: 5px 20px;
    }

    &__mel-key {
      font-weight: bold;
    }

    &__mel-value {

    }

    &__due-date {
      background: transparentize($brand-info, .8);
      padding: 5px 20px;
      margin-bottom: 10px;
      color: transparentize($text-color, .2);
    }

    &__due-date-value {
      font-size: 16px;
      font-weight: bold;
      color: $text-color;
    }

    .el-dialog__body {
      padding: 10px 0;
      width: 520px;
    }

    .el-select {
      width: 100%;
    }
  }
</style>
