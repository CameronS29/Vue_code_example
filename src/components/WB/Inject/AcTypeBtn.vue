<script>
  import { mapActions } from 'vuex';
  import PropsModal from './Modal.vue';

  export default {
    props: {
      type: String,
    },

    components: { PropsModal },

    methods: {
      ...mapActions('wb/aircraft-params', ['setActiveAircraftTypeId']),

      handleCustomizeWbClick() {
        this.setActiveAircraftTypeId(parseInt(this.type));
      },
    },
  };
</script>

<template>
  <div>
    <el-button type="primary" size="mini" round @click="handleCustomizeWbClick">
      Customize WB Properties
    </el-button>
    <props-modal />
  </div>
</template>
