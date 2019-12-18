<script>
  import { map, flatten } from 'lodash';
  import { Alert } from 'element-ui';

  export default {
    name: 'ErrorsAlert',
    props: {
      errors: Object,
    },

    components: {
      ElAlert: Alert,
    },

    computed: {
      errorsList() {
        return flatten(map(this.errors));
      },
    },
  };
</script>

<template>
  <el-alert class="wb-detail__errors-alert"
            title="Errors in Log"
            type="error"
            :closable="false">
    <ul class="wb-detail__errors-list">
      <li class="wb-detail__errors-item"
          v-for="(err, idx) in errorsList"
          :key="idx">
        {{ err }};
      </li>
    </ul>
  </el-alert>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .wb-detail {
    &__errors-alert {
      border: $--border-width-base $--border-style-base $--color-danger-light;

      .el-alert__content {
        width: 100%;
      }
    }

    &__errors-list {
      margin-top: 10px;
      padding-left: 18px;
    }
  }
</style>
