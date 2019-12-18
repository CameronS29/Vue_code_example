import {mapGetters, mapActions} from 'vuex';
import Collapse from 'Common/Collapse.vue';
import GroupSplit from "Common/Form/GroupSplit.vue";
import DutyTimeField from "./DutyTimeField.vue";

export default {
  components: {
    Collapse,
    DutyTimeField,
    GroupSplit,
  },
  computed: {
    ...mapGetters('pilotManifest', [
      'manifest',
      'duties',
      'picDuty',
      'sicDuty',
    ])
  },
  methods: {
    updateDtField() {
      this.$emit('update:manifest');
    }
  }
};
