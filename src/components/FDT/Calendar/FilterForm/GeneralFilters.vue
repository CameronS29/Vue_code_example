<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  import { SET_ACTUAL } from 'store/modules/fdt/calendar';
  import permissionMixin from '../../Common/permissionMixin';
  import { queryParam } from '../../../../utils/routers';
  import filterMixin from './filterMixin';


  export default {
    mixins: [
      permissionMixin,
      filterMixin,
    ],

    created() {
      if (this.queryRevision) {
        this.editableRevisionId = this.queryRevision;
      }
    },

    computed: {
      ...mapState('fdt/calendar', [
        'revisionId',
        'isActual',
        'showDutyForm',
      ]),

      ...mapGetters('fdt/calendar', ['hasActualDate']),
      ...mapGetters('scheduling/revisions', [
        'hasRevisions',
        'sortedRevisions',
        'byId',
      ]),

      editableRevisionId: {
        get() {
          return this.revisionId;
        },
        set(value) {
          if (!value) {
            this[SET_ACTUAL](false);
          }
          return this.setRevision(value || undefined);
        },
      },

      queryRevision: queryParam({
        param: 'revision',
        load: Number,
      }),

      editableActual: {
        get() {
          return this.isActual;
        },
        set(value) {
          return this.setActual(value || undefined);
        },
      },
    },

    methods: {
      ...mapMutations('fdt/calendar', [SET_ACTUAL]),
      ...mapActions('fdt/calendar', ['setRevision', 'setActual']),
    },
  };
</script>

<template>
  <div class="fdt-filter-form">
    <el-select
      v-if="!onlyPilot"
      class="fdt-filter-form__field fdt-filter-form__field_pilot"
      v-model="editablePilotId"
      filterable
      placeholder="Pick Pilot"
    >
      <el-option-group v-for="({ label, options }) in pilotActivityGroups"
                       :key="label"
                       :label="label">
        <el-option v-for="pilot in options" :key="pilot.id" :value="pilot.id" :label="pilot.name" />
      </el-option-group>
    </el-select>
    <div v-else class="fdt-filter-form__field fdt-filter-form__field_pilot fdt-filter-form__field_pilot-ro">
      <span>Pilot: </span><strong>{{ pilot.first_name }} {{ pilot.last_name }}</strong>
    </div>
    <el-select
      class="fdt-filter-form__field fdt-filter-form__field_revision"
      placeholder="Actual"
      v-model="editableRevisionId"
      v-if="hasRevisions"
      clearable
    >
      <el-option
        v-for="revision in sortedRevisions"
        :key="revision.id"
        :value="revision.id"
        :label="`Revision ${revision.version} ${revision.published ? '' : '(Draft)'}`"
      />
    </el-select>

    <el-tooltip
      content="Display Only Revision Duties / Combine with Actual Flights"
      placement="bottom"
      v-if="editableRevisionId"
    >
      <el-switch
        class="fdt-filter-form__switch"
        active-icon-class="fa fa-plane"
        inactive-icon-class="fa fa-calendar"
        v-model="editableActual"
      />
    </el-tooltip>

    <div class="fdt-filter-form__field fdt-filter-form__field_time">
      <el-date-picker
        type="month"
        :clearable="false"
        format="MM/yyyy"
        v-model="editableDate"
      />

      <el-select class="fdt-filter-form__field__select_tz" v-model="editableTz">
        <el-option
          v-for="timezone in timezones"
          :key="timezone[0]"
          :value="timezone[1]"
          :label="timezone[0]"
        />
      </el-select>

      <el-button
        type="primary"
        icon="el-icon-time"
        size="small"
        class="fdt-filter-form__select-current fdt-filter-form__field"
        title="Show current month view"
        :disabled="dateButtonDisabled"
        @click="setCurrentDate"
      />
    </div>

    <el-button
      class="fdt-filter-form__customize fdt-filter-form__field"
      type="primary"
      size="mini"
      icon="el-icon-edit"
      @click="handleToggleDutyForm"
      title="Manage">Manage</el-button>
  </div>
</template>

<style lang="scss">
  .fdt-filter-form {
    display: flex;
    justify-content: flex-end;
    flex-flow: row wrap;

    &__field {
      display: flex;
      flex-direction: row;
      margin: 5px;
    }

    &__switch {
      align-self: center;
      margin-right: 5px;
    }

    &__field .el-input__inner {
      height: 34px;
    }

    &__field .el-input__icon {
      line-height: 34px;
    }

    &__field .el-date-editor.el-input,
    &__field .el-date-editor.el-input__inner {
      width: 120px;
    }

    &__field_pilot {
      flex: 1 0 140px;
    }

    &__field_pilot-ro {
      align-items: center;
      text-align: right;
    }

    &__field_time {
      flex: 1 0 200px;
    }

    &__field_revision {
      flex: 1 0 100px;
    }

    &__field__select_tz {
      width: 80px;
    }

    &__field > * {
      flex: 1 100%;
      margin-right: 5px;
    }

    &__field > *:last-child {
      margin-right: 0;
    }

    &__field__select_tz {
      flex-basis: 65%;
    }

    &__select-current {
      flex-basis: 40px;
      margin: 1px 0;
      padding: 0;
    }

    &__customize {
      padding: 0 7px 0 5px;
      margin: 6px;
      border: 0;
    }
  }
</style>
