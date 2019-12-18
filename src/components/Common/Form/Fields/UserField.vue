<script>
  import { mapState, mapActions, mapGetters } from 'vuex';

  export default {
    created() {
      if (!this.availableUsers.length) {
        this.getAvailableUsers();
      }
    },
    props: {
      value: [Array, Number],
      controlProps: Object,
    },
    computed: {
      ...mapGetters('wb', ['availableUsers']),

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

      userList() {
        return this.availableUsers;
      },

      elementProps() {
        return Object.assign(this.defaultControlProps, this.controlProps);
      },
    },
    methods: {
      ...mapActions('wb', ['getAvailableUsers']),
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
      v-for="user in userList"
      :key="user.id"
      :label="user.name"
      :value="user.id" />
  </el-select>
</template>
