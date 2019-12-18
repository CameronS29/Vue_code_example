<script>
  import filter from 'lodash/filter';
  import { DateTime } from 'luxon';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import Collapse from 'Common/Collapse.vue';
  import { Row, Col } from 'element-ui';

  export default {
    props: {
      checkList: {
        type: Array,
        default: []
      },
      field: {
        type: String
      },
      label: {
        type: String
      },
      aircraftType: {
        type: String,
        default: ''
      },
    },

    computed: {
      ...mapGetters('security', [
        'item',
      ]),
      value() {
        return this.item[this.field];
      },
      selectedItems() {
        console.log(this.value);
        const keys = Object.keys(this.value);
        console.log(keys);
        return filter(this.checkList, v=>keys.indexOf(v.id) > -1).map(v=>v.label);
      },
      notes() {
        return this.item[this.field+'_notes']
      }
    },
  };
</script>


<template>
  <div>
    <p>{{ `Preflight - ${label} ${aircraftType}` }}</p>
    <p v-for="item in selectedItems">
      <i class="fa fa-check">&nbsp;&nbsp;{{item}}</i>
    </p>
    <p>Additonal Notes: <strong>{{ notes }}</strong></p>
  </div>
</template>
