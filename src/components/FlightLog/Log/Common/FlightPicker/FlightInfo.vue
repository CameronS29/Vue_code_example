<script>
  import { Row, Col } from 'element-ui';

  import Group from 'Common/Form/Group.vue';
  import ButtonEl from 'Common/Button.vue';

  export default {
    props: {
      flight: {
        type: Object,
        default: () => ({}),
      },
      visible: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      ElRow: Row,
      ElCol: Col,
      Group,
      ButtonEl,
    },
    computed: {
      visibilityFlag: {
        get() {
          return this.visible;
        },
        set(value) {
          if (!value) this.$emit('close');
        },
      },
    },
    methods: {},
  };
</script>

<template>
  <el-dialog
    title="Flight Information"
    :visible.sync="visibilityFlag">
    <div
      class="flight-info"
      v-if="flight">
      <el-row :gutter="30">
        <el-col :sm="4">
          <group label="Flight number">
            {{ flight.flight_number }}
          </group>
        </el-col>
        <el-col :sm="4">
          <group label="Origin">
            {{ flight.origin }}
          </group>
        </el-col>
        <el-col :sm="6">
          <group label="Scheduled Depature Date/time (UTC)">
            {{ flight.scheduled_departure | longDT }}
          </group>
        </el-col>
        <el-col :sm="4">
          <group label="Destination">
            {{ flight.destination }}
          </group>
        </el-col>
        <el-col :sm="6">
          <group label="Scheduled Arrival Date/time (UTC)">
            {{ flight.scheduled_arrival | longDT }}
          </group>
        </el-col>
      </el-row>

      <el-row :gutter="30">
        <el-col :sm="8">
          <group label="Type of Operation(scheduled, etc)">
            {{ flight.type_of_operations }}
          </group>
        </el-col>
        <el-col :sm="8">
          <group label="Type of operation(part 91/135)">
            {{ flight.operating_under }}
          </group>
        </el-col>
      </el-row>


      <el-row :gutter="30" class="flight-info__btns">
        <el-col :md="8">
          <button-el class="flight-info__btn" type="warning" @click="$emit('click-edit')">
            Edit unscheduled flight details
          </button-el>
        </el-col>
        <el-col :md="8">
          <button-el class="flight-info__btn" type="success" @click="$emit('click-select')">
            Select a different scheduled flight
          </button-el>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<style lang="scss">
  .flight-info {
    .btq-form__label {
      font-weight: 700;
    }
    &__btns {
      margin-top: 15px;
    }
    &__btn {
      width: 100%;
      margin-bottom: 5px;
    }
  }
</style>
