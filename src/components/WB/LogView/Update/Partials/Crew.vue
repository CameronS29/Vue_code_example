<script>
  import { mapGetters, mapActions } from 'vuex';
  import { find } from 'lodash';
  import { or, and, requiredIf } from 'vuelidate/lib/validators';
  import Card from 'Common/Card.vue';

  import { isPositive } from '../../../../../validators/numberOrEmpty';
  import notZeroIf from '../../../../../validators/notZeroIf';


  import updateLogMixin, { logProperty, toNumber } from './updateLogMixin';

  export default {
    mixins: [updateLogMixin],

    components: { Card },

    created() {
      this.getAvailablePilots();
      this.getAvailableUsers();
    },

    computed: {
      ...mapGetters('wb', [
        'availablePilots',
        'availableSICPilots',
        'availableUsers',
        'selectedPIC',
        'selectedSIC',
        'availablePICPilots',
        'validate',
        'detailed',
        'getCalcValue',
      ]),


      pic: {
        get() {
          return this.log.pic;
        },
        set(value) {
          const pilot = find(this.availablePilots, { id: Number(value) });
          const isPilotExists = pilot !== undefined;

          this.setPartialUpdate({
            pic: (isPilotExists ? pilot.id : null),
            pic_weight: (isPilotExists ? pilot.weight : null),
          });
          this.$emit('update:log');
        },
      },

      sic: {
        get() {
          return this.log.sic;
        },
        set(value) {
          const pilot = find(this.availablePilots, { id: toNumber(value) });
          const isPilotExists = pilot !== undefined;

          this.setPartialUpdate({
            sic: (isPilotExists ? pilot.id : null),
            sic_weight: (isPilotExists ? pilot.weight : null),
          });
          this.$emit('update:log');
        },
      },

      gsc: logProperty('gsc', toNumber),
      guestSicName: logProperty('guest_sic'),
      sicWeight: logProperty('sic_weight', toNumber),
      sicGateBag: logProperty('sic_gate_bag', toNumber),
      picWeight: logProperty('pic_weight', toNumber),
      picGateBag: logProperty('pic_gate_bag', toNumber),
    },

    methods: {
      ...mapActions('wb', [
        'getAvailablePilots',
        'getAvailableUsers',
      ]),

      toggleGuest() {
        this.guestSicName = (
          this.guestSicName === null
            ? ''
            : null
        );
        this.sic = null;
      },
    },

    validations: {
      pic: {
        required: requiredIf('validate'),
      },

      picWeight: {
        ifValidate: and(
          notZeroIf('pic'),
          notZeroIf('validate'),
        ),
      },

      picGateBag: {
        isPositive,
      },

      sicWeight: {
        notZeroSic: or(notZeroIf('sic'), notZeroIf('guestSicName')),
      },

      sicGateBag: {
        isPositive,
      },
    },
  };
</script>

<template>
  <card title="Crew">
    <div v-loading="availablePilots.length === 0" class="wb-crew">
      <table class="wb-crew__table">
        <thead>
          <tr>
            <th class="wb-crew__cell wb-crew__cell_type" />
            <th class="wb-crew__cell wb-crew__cell_name" />
            <th class="wb-crew__cell wb-crew__cell_weight">Weight</th>
            <th class="wb-crew__cell wb-crew__cell_bag">Gate Bag</th>
            <th v-if="detailed" class="wb-crew__cell wb-crew__cell_mom">MOM</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th class="wb-crew__cell wb-crew__cell_type">PIC</th>
            <td class="wb-crew__cell wb-crew__cell_name" :class="{ error: $v.pic.$invalid }">
              <el-select v-model="pic"
                         :disabled="disabled"
                         size="small"
                         placeholder="Pick Pilot"
                         filterable
                         clearable>
                <el-option
                  v-for="pilot in availablePICPilots"
                  :key="pilot.id"
                  :value="pilot.id"
                  :label="pilot.name"
                />
              </el-select>
              <span class="form-group__message" v-if="$v.pic.$invalid">Field is required</span>
            </td>
            <td class="wb-crew__cell wb-crew__cell_weight" :class="{ error: $v.picWeight.$invalid }">
              <label for="pic_weight">PIC Weight</label>
              <el-input
                type="tel"
                id="pic_weight"
                v-model="picWeight"
                size="small"
                :disabled="disabled"
              />
              <span class="form-group__message" v-if="$v.picWeight.$invalid">Weight is required</span>
            </td>
            <td class="wb-crew__cell wb-crew__cell_bag" :class="{ error: $v.picGateBag.$invalid }">
              <label for="pic_weight">PIC Gate bag</label>
              <div class="split-input">
                <el-input
                  type="tel"
                  size="small"
                  id="pic_gate_bag"
                  v-model="picGateBag"
                  :disabled="disabled"
                />
              </div>
              <span class="form-group__message" v-if="$v.picGateBag.$invalid">Invalid weight value</span>
            </td>
            <td v-if="detailed">
              {{ getCalcValue('moments.pilot_moments[0]') }}
            </td>
          </tr>

          <tr>
            <th class="wb-crew__cell wb-crew__cell_type">SIC</th>
            <td class="wb-crew__cell wb-crew__cell_name">
              <div class="wb-crew__guest-switch">
                <el-select v-if="guestSicName === null"
                           v-model="sic"
                           :disabled="disabled"
                           placeholder="Pick Pilot (optional)"
                           size="small"
                           filterable
                           clearable>
                  <el-option
                    v-for="pilot in availableSICPilots"
                    :key="pilot.id"
                    :value="pilot.id"
                    :label="pilot.name"
                  />
                </el-select>
                <div v-else>
                  <el-input v-model="guestSicName"
                            placeholder="Type Guest Pilot Name"
                            size="small"
                            :disabled="disabled" />
                </div>
                <el-button title="Add a Guest Pilot"
                           size="small"
                           type="info"
                           plain
                           @click="toggleGuest"
                           :disabled="disabled"
                           :icon="guestSicName === null ? 'el-icon-plus' : 'el-icon-close'" />
              </div>
            </td>
            <td class="wb-crew__cell wb-crew__cell_weight" :class="{ error: $v.sicWeight.$invalid }">
              <label for="sic_weight">SIC Weight</label>
              <el-input
                type="tel"
                id="sic_weight"
                size="small"
                v-model="sicWeight"
                :disabled="disabled"
              />
              <span class="form-group__message" v-if="$v.sicWeight.$invalid">Weight is required</span>
            </td>
            <td class="wb-crew__cell wb-crew__cell_bag" :class="{ error: $v.sicGateBag.$invalid }">
              <label for="sic_gate_bag">SIC Gate bag</label>
              <div class="split-input">
                <el-input
                  type="tel"
                  size="small"
                  id="sic_gate_bag"
                  v-model="sicGateBag"
                  :disabled="disabled"
                />
              </div>
              <span v-if="$v.sicGateBag.$invalid" class="form-group__message">Invalid weight value</span>
            </td>
            <td v-if="detailed">
              {{ getCalcValue('moments.pilot_moments[1]') }}
            </td>
          </tr>

          <tr>
            <th class="wb-crew__cell wb-crew__cell_type">GSC</th>
            <td class="wb-crew__cell wb-crew__cell_name">
              <el-select v-model="gsc"
                         :disabled="disabled"
                         size="small"
                         placeholder="Select GSC (optional)"
                         filterable
                         clearable>
                <el-option
                  v-for="user in availableUsers.filter(u => (u.name.trim() !== ''))"
                  :key="user.id"
                  :value="user.id"
                  :label="user.name"
                />
              </el-select>
            </td>
            <td colspan="2">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
  </card>
</template>

<style lang="scss">
  @import "numpad-field";
  @import '../../../../../../scss/bs-variables';

  .wb-crew {
    &__table {
      width: 100%;

      td { padding: 6px 3px; }
      tbody tr:hover td {
        background: rgba(0,0,0,.04);
      }
    }

    &__cell {
      vertical-align: top;

      &_type {
        min-width: 30px;
        vertical-align: middle;
      }
      &_name { width: 40%; }
      &_weight { width: 30%; }
      &_bag { width: 30%; }

      .el-select {
        display: block;
      }
    }

    &__numpad-field {
      @include numpad-field;
    }

    &__guest-switch {
      display: flex;
      & > div {
        flex-grow: 1;
      }
      .el-input__inner {
        border-radius: 4px 0 0 4px;
      }
      button {
        border-left: 0;
        border-radius: 0 3px 3px 0;
        padding:0 8px;
      }
    }

    label {
      display: none;

      @media screen and (max-width: $screen-phone) {
        display: block;
      }
    }

    @media screen and (max-width: $screen-phone) {
      &__table {
        display: block;
        thead { display: none; }
        tbody { display: block; }
        tr {
          display: flex;
          flex-flow: row wrap;
        }
        td { display: block; }
      }

      &__cell {
        flex: 0 0 100%;
        &_weight { flex: 0 0 50%; }
        &_bag { flex: 0 0 50%; }
      }
    }
  }
</style>
