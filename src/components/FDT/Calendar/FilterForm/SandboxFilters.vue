<script>
  import filterMixin from './filterMixin';

  export default {
    name: 'SandboxFilters',
    mixins: [filterMixin],
  };
</script>

<template>
  <div class="fdt-sandbox-filters">
    <el-select v-model="editablePilotId"
               class="fdt-sandbox-filters__pilots"
               filterable
               placeholder="Pick Pilot"
               size="small">
      <el-option-group v-for="({ label, options }) in pilotActivityGroups"
                       :key="label"
                       :label="label">
        <el-option v-for="pilot in options" :key="pilot.id" :value="pilot.id" :label="pilot.name" />
      </el-option-group>
    </el-select>

    <el-date-picker class="fdt-sandbox-filters__month-picker"
                    type="month"
                    size="small"
                    :clearable="false"
                    format="MM/yyyy"
                    v-model="editableDate" />

    <el-select class="fdt-sandbox-filters__tz" v-model="editableTz" size="small">
      <el-option
        v-for="timezone in timezones"
        :key="timezone[0]"
        :value="timezone[1]"
        :label="timezone[0]"
      />
    </el-select>

    <el-button
      icon="el-icon-time"
      size="small"
      title="Show current month view"
      :disabled="dateButtonDisabled"
      @click="setCurrentDate"
    />

    <el-button icon="el-icon-edit" size="small" @click="handleToggleDutyForm">
      Manage
    </el-button>
  </div>
</template>

<style lang="scss">
  .fdt-sandbox-filters {
    display: flex;
    justify-content: flex-end;

    & > * {
      margin-left: 5px;
      margin-right: 5px;
    }

    &__pilots {
      flex: 0 0 180px;
    }

    &__month-picker {
      flex: 0 0 120px;
    }

    &__tz {
      flex: 0 0 90px;
    }
  }
</style>
