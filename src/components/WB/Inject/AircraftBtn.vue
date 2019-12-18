<script>
  import { mapActions } from 'vuex';
  import PropsModal from './Modal.vue';

  export default {
    props: {
      aircraft: String,
      type: String,
    },

    components: { PropsModal },

    methods: {
      ...mapActions('wb/aircraft-params', ['setActiveAircraftId']),

      handleCustomizeWbClick() {
        const data = {
          aircraftId: this.aircraft,
          aircraftTypeId: this.type,
        };

        this.setActiveAircraftId(data);
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

