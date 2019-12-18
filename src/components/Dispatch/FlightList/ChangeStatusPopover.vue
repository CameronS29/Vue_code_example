<script>
  import {DateTime} from 'luxon';
  import {required} from 'vuelidate/lib/validators';

  import ButtonEl from 'Common/Button.vue';
  import RightBar from 'Common/RightBar.vue';
  import {mapState, mapGetters, mapMutations, mapActions} from 'vuex';
  import {fireEvent} from 'utils/DOM';
  import Group from 'Common/Form/Group.vue';

  import {
    SET_CODE_FILTER, SET_CODE, SET_STATUS, ERROR_STATUSES, RESET_EDITABLE,
    SET_REASON, SET_BAD_WEATHER, DEACTIVATE, SET_DELAY_HOURS, SET_DELAY_MINUTES, FLIGHT_STATUS_CLASS
  } from 'store/modules/dispatch/status-change';
  import { TABLE_NAMESPACE, PATCH_FLIGHT } from 'store/modules/dispatch/flight-list';

  import DateTimeField from 'Common/Form/Fields/DateTimeField.vue';

  const parse = date => DateTime.fromISO(date)
    .setZone('UTC');

  export default {
    props: {
      pathMutation: {
        type: String,
        default: `${TABLE_NAMESPACE}/${PATCH_FLIGHT}`,
      },
    },
    created() {
      if (!this.availableOfficialCodes.length) {
        this.getAvailableOfficialCodes();
      }

      document.addEventListener('click', this.handleClickOutside);
    },
    destroyed() {
      document.removeEventListener('click', this.handleClickOutside);
    },
    components: {
      ButtonEl,
      RightBar,
      DateTimeField,
      Group,
    },
    data() {
      return {
        ERROR_STATUSES,
        loading: false,
      };
    },
    computed: {
      ...mapState('dispatch/flight-list/status-change', [
        'editableFlightId',
        'editableFlights',
        'availableOfficialCodes',
        'availableFlightStatuses',
        'codeFilter',
        'originalStatus',
        'status',
        'is_delayed',
        'code',
        'active',
        'reason',
        'bad_weather',
        'scheduled_departure',
        'delayHours',
        'delayMinutes',
      ]),
      ...mapGetters('dispatch/flight-list/status-change', [
        'isSingleFlightEditing',
        'filteredCodes',
        'estimatedDeparture',
      ]),
      codeSearchString: {
        get() {
          return this.codeFilter;
        },
        set(value) {
          this[SET_CODE_FILTER](value);
        },
      },
      selectedStatus: {
        get() {
          return this.status;
        },
        set(value) {
          this[SET_STATUS](value);
        },
      },
      selectedCode: {
        get() {
          return this.code;
        },
        set(value) {
          this[SET_CODE](value);
        },
      },
      selectedReason: {
        get() {
          return this.reason;
        },
        set(value) {
          this[SET_REASON](value);
        },
      },
      selectedBadWeather: {
        get() {
          return this.bad_weather;
        },
        set(value) {
          this[SET_BAD_WEATHER](value);
        },
      },
      editableDelayHours: {
        get() {
          return this.delayHours;
        },
        set(value) {
          this[SET_DELAY_HOURS](parseInt(value));
        },
      },
      editableDelayMinutes: {
        get() {
          return this.delayMinutes;
        },
        set(value) {
          this[SET_DELAY_MINUTES](parseInt(value));
        },
      },
      isInDelayStatus() {
        return this.status === 4;
      },
      isInCanceltatus() {
        return this.status === 3;
      },
      isImpactRemoval() {
        return this.status === 5 && this.originalStatus !== 5;
      },
      isInErrorStatus() {
        return (ERROR_STATUSES.indexOf(this.status) > -1 || this.is_delayed) && !this.isImpactRemoval;
      },
      popperClass() {
        return [
          'change-status__popper',
          this.isInErrorStatus ? 'change-status__popper_error-status' : undefined,
        ].join(' ');
      },
    },
    methods: {
      ...mapActions('dispatch/flight-list/status-change', [
        'getAvailableOfficialCodes',
        'patchEditableFlight',
        'patchEditableFlights',
      ]),
      ...mapMutations('dispatch/flight-list/status-change', [
        SET_CODE_FILTER,
        SET_CODE,
        SET_STATUS,
        SET_REASON,
        SET_BAD_WEATHER,
        SET_DELAY_HOURS,
        SET_DELAY_MINUTES,
        RESET_EDITABLE,
        DEACTIVATE,
      ]),
      async handleApply() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        this.loading = true;
        if (this.isSingleFlightEditing) {
          await this.patchEditableFlight(this.pathMutation);
        } else {
          await this.patchEditableFlights();
        }
        this.loading = false;
        this[DEACTIVATE]();
        this[RESET_EDITABLE]();
      },
      getStatusClass(status) {
        let statusClass = {};
        statusClass["change-status_" + FLIGHT_STATUS_CLASS[status]] = true;
        return statusClass;
      },
      handleHide() {
        this.resetValidation();
        this[DEACTIVATE]();
      },
      resetValidation() {
        this.$v.$reset();
      },
      handleClickOutside(event) {
        if (this.active && this.$el.contains(event.target)) return;

        this.handleHide();
      },
    },
    filters: {
      time(value) {
        return parse(value)
          .toLocaleString(DateTime.TIME_24_SIMPLE);
      },
      date(value) {
        return parse(value)
          .toFormat('MM/dd');
      },
      year(value) {
        return parse(value)
          .toFormat('yyyy');
      },
    },
    mounted() {
    },
    validations: {
      delayMinutes: {
        required() {
          if (!this.isInDelayStatus) return true;
          return (this.delayHours > 0) || (this.delayMinutes > 0);
        },
      },
      reason: {
        required() {
          if (!this.isInErrorStatus) return true;
          return !!this.reason && this.reason.length;
        },
      },
      code: {
        required() {
          if (!this.isInErrorStatus) return true;
          return !!this.code;
        },
      },
    },
    watch: {
      editableFlightId: 'resetValidation',
      editableFlights: 'resetValidation',
    },
  };
</script>

<template>
  <right-bar
    :popper-class="popperClass"
    @hide="handleHide"
    :show="active"
    trigger="click">
    <div class="change-status" v-loading="loading">
      <header class="change-status__header">
        <div class="change-status__statuses">
          <el-radio
            :key="id"
            v-for="(status, id) in availableFlightStatuses"
            size="mini"
            :class="getStatusClass(id)"
            v-model="selectedStatus"
            :label="parseInt(id)"
            border>{{ status }}
          </el-radio>
        </div>
        <div class="change-status__apply">
          <div class="change-status__apply-note">
            status will be immediately pushed to ba-web portal
          </div>
          <button-el @click="handleApply" size="xs" icon="check">Apply</button-el>
        </div>
      </header>
      <div>
        <div class="change-status__time-block">
          <div v-if="scheduled_departure && isInDelayStatus" class="change-status__time-block-data">
            <div class="change-status__time-block-title">Scheduled Departure</div>
            <div class="change-status__time-block-body">
              <span class="change-status__time-block-date">
                {{ scheduled_departure | date }}
                <span class="change-status__time-block-year">
                  {{ scheduled_departure | year }}
                </span>
              </span>
              <span class="change-status__time-block-time">
                {{ scheduled_departure | time }}
              </span>
            </div>
          </div>
          <div class="change-status__time-block-data" v-if="isInDelayStatus">
            <div class="change-status__time-block-title">Delay</div>
            <div class="change-status__time-block-body">
              <div class="change-status__editable-delay">
                <el-input v-model="editableDelayHours" :min="0" :max="23" type="number"/>
                <span class="change-status__editable-delay-label">h.</span>
              </div>
              <div class="change-status__editable-delay">
                <el-input v-model="editableDelayMinutes" :min="0" :max="59" type="number"/>
                <span class="change-status__editable-delay-label">min.</span>
              </div>
            </div>
          </div>
          <div v-if="estimatedDeparture && isInDelayStatus" class="change-status__time-block-data">
            <div class="change-status__time-block-title">Estimated Departure</div>
            <div class="change-status__time-block-body">
              <span class="change-status__time-block-date">
                {{ estimatedDeparture | date }}
                <span class="change-status__time-block-year">
                  {{ estimatedDeparture | year }}
                </span>
              </span>
              <span class="change-status__time-block-time">
                {{ estimatedDeparture | time }}
              </span>
            </div>
          </div>
          <div class="change-status__bad_weather" v-if="isInErrorStatus">
            <el-checkbox v-model="selectedBadWeather" label="Weather is the primary cause" border></el-checkbox>
          </div>
        </div>
      </div>
      <div class="change-status__error" v-if="$v.delayMinutes.$error">Delay should be specified</div>
      <div
        v-if="isInErrorStatus"
        class="change-status__reason-weather">
        <el-input
          type="textarea"
          :rows="13"
          placeholder="Reason"
          class="change-status__reason"
          v-model="selectedReason"/>


      </div>
      <div class="change-status__error" v-if="$v.reason.$error">Reason can't be empty</div>
      <div
        v-if="isInErrorStatus"
        class="change-status__codes">
        <div class="change-status__code-filter">
          <el-input size="mini" placeholder="Official codes" v-model="codeSearchString">
            <i slot="prefix" class="el-input__icon el-icon-search"/>
          </el-input>
        </div>
        <div class="change-status__code-list">
          <label
            :key="code.id"
            v-for="code in filteredCodes"
            class="change-status__code">
            <el-radio v-model="selectedCode" :label="code.id"/>
            <div class="change-status__code-desc">
              <strong>{{ code.code }}</strong> - {{ code.verbose }} - {{ code.description }}
            </div>
          </label>
        </div>
      </div>
      <div v-if="isImpactRemoval" class="change-status__impact_removal">
        <el-alert
          show-icon
          type="error">
          Flight will be marked as On-Time. Delay, reason and official code will be removed.
        </el-alert>
      </div>
      <div class="change-status__error" v-if="$v.code.$error">Official code should be selected</div>
    </div>
  </right-bar>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';
  @import "./flight-status";

  .change-status {
    font-size: 12px;
    display: flex;
    flex-flow: column;
    max-height: 100vh;
    max-width: calc(100vw - 230px);
    width: 1200px;
    &__popper {
      width: 320px;
      &_error-status {
        width: 1200px;
        @media screen and (max-width: 1200px) {
          width: 320px;
        }
      }
    }
    &__bad_weather {
      margin-left: 20px;
      align-self: center;
    }
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      flex: 0 0 40px;
      padding: 0 10px;
    }
    &__impact_removal {
      font-size: 19px;
    }

    &__red-status {
      color: $red !important;
      border-color: $red !important;
      .el-radio__label {
        color: $red !important;
      }
      .el-radio__inner {
        border-color: $red !important;
      }
      .el-radio__input.is-checked .el-radio__inner {
        background: $red !important;
      }
    }

    &__statuses {
      display: flex;
      flex-flow: row wrap;
      .el-radio {
        margin: 0 5px 0 0 !important;
        font-size: 12px;
        padding: 4px 6px;
        height: 22px;
      }
    }
    &__apply {
      display: flex;
      align-items: center;
      padding: 0 20px;
      margin: 0 -20px;
    }
    &__apply-note {
      color: $red;
      margin-right: 10px;
      line-height: 1.2;
    }

    &__time-block {
      padding: 0 0 13px 0;
      display: flex;

      &-data {
        flex-flow: column;
        display: flex;
        padding: 12px;

      }
      &-title {
      }

      &-body {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      &-date {
        margin-right: 10px;
        display: flex;
        flex-flow: column;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
      }
      &-year {
        font-size: 13px;
        font-weight: bold;
        color: #b1aeae;
      }
      &-time {
        font-size: 24px;
        font-weight: bold;
      }
    }

    &__editable-delay {
      display: flex;
      align-items: center;
    }

    &__editable-delay-label {
      font-weight: bold;
      display: block;
      margin: 0 10px 0 3px;
    }

    &__reason-weather {
      display: flex;
      padding: 10px;
      flex: 0 0;
      background-color: #eff6f6;
      @media screen and (max-width: 1200px) {
        flex-flow: column;
      }
    }
    &__reason {
      font-size: 11px;
      margin: 0 10px 0 0;
      @media screen and (max-width: 1200px) {
        margin: 0 0 10px 0;
      }
    }
    &__weather {
      display: flex;
      align-items: center;
    }

    &__codes {
      flex: 1 1;
      display: flex;
      flex-flow: column;
      padding: 10px 10px 0;
    }
    &__code-filter {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      flex: 0 0 30px;
    }
    &__code-list {
      flex: 1 1;
      overflow-y: auto;
      column-count: 3;
      padding-right: 10px;
      @media screen and (max-width: 1200px) {
        column-count: 1;
      }
    }
    &__code {
      display: inline-flex;
      margin-bottom: 10px;
      font-weight: normal;
      @media screen and (max-width: 1200px) {
        display: flex;
      }
      .el-radio {
        position: relative;
        top: 2px;
        &__label {
          font-size: 0;
        }
      }
    }
    &__code-desc {
      text-align: left;
    }

    &__error {
      color: $red;
      background: #fef0f0;
      padding: 5px 10px;
    }

  }
</style>
