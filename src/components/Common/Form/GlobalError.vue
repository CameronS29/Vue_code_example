<script>
  import {mapGetters, mapActions} from 'vuex';
  import filter from "lodash/filter";
  import keys from "lodash/keys";
  import map from "lodash/map";
  import mapKeys from "lodash/mapKeys";
  import mapValues from "lodash/mapValues";
  import flattenDeep from "lodash/flattenDeep";

  export default {
    props: ["validationData"],
    inject: {
      formFieldErrors: {default: {}},
      formGlobalErrors: {default: []},
    },
    computed: {
      errors() {
        return filter(flattenDeep(map(keys(this.validationData.$params), (field) => {
          return map(keys(this.validationData[field].$params), (type) => {
            if (this.validationData[field].$error && !this.validationData[field][type]
              && this.formGlobalErrors.indexOf(type) !== -1 && this.formFieldErrors[type]) {
              return this.formFieldErrors[type]();
            }
          })
        })));
      }
    }
  }
</script>

<template>
  <div>
    <div v-for="error in errors">
      <el-alert
        :title="error"
        type="error">
      </el-alert>
    </div>
  </div>
</template>

<style>
  .el-alert {
    margin-bottom: 10px;
  }
</style>
