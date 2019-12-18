<script>
  import { mapState, mapActions, mapGetters } from 'vuex';

  export default {
    created() {
      if (!this.availablePICPilots.length) {
        this.getAvailablePilots();
      }
    },
    props: {
      value: [Array, Number],
      controlProps: Object,
      field: { String, default: "profile" },
      type: {
        type: [Boolean, String],
        default: false,
        validator: val => !val || ['PIC', 'SIC'].includes(val),
      },
    },
    computed: {
      ...mapGetters('wb', ['availablePilots', 'availablePICPilots', 'availableSICPilots',]),

      model: {
        get() {
          return this.elementProps.multiple
            ? this.value.map(value => parseInt(value))
            : (this.value ? parseInt(this.value) : null);
        },
        set(value) {
          this.$emit('input', value);
        },
      },

      pilotList() {
        if (this.type == 'PIC') return this.availablePICPilots;
        if (this.type == 'SIC') return this.availableSICPilots;

        return this.availablePilots;
      },

      elementProps() {
        return Object.assign(this.defaultControlProps, this.controlProps);
      },
    },
    methods: {
      ...mapActions('wb', ['getAvailablePilots']),
      getId(row){
        return this.field === 'user' ? row.id : row.profile_id;
      },
    },
    data() {
      return {
        defaultControlProps: {
          filterable: true,
          multiple: true,
        },
      };
    },
  };
</script>

<template>
  <el-select
    v-model="model"
    v-bind="elementProps"
  >
    <el-option
      v-for="pilot in pilotList"
      :key="getId(pilot)"
      :label="pilot.name"
      :value="getId(pilot)" />
  </el-select>
</template>
