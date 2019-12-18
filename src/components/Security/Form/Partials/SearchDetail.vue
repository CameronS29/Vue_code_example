<script>
  import reduce from 'lodash/reduce';
  import map from 'lodash/map';
  import without from 'lodash/without';
  import { DateTime } from 'luxon';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import Collapse from 'Common/Collapse.vue';
  import { Row, Col, Checkbox, CheckboxGroup, Input } from 'element-ui';
  import ButtonEl from "Common/Button.vue";
  import Group from "Common/Form/Group.vue";
  import GroupSplit from "Common/Form/GroupSplit.vue";
  import SelectField from "../../../fields/Selectize.vue";
  import PickFlight from "../../../FlightLog/ManifestView/Update/PickFlight/Modal.vue";
  import { UPDATE_FORM } from '../../../../store/modules/security/consts';
  import {required} from 'vuelidate/lib/validators';
  import { mapFormTextField } from "../../../../store/helpers/forms";

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
    components: {
      Collapse,
      ElRow: Row,
      ElCol: Col,
      Group,
      CheckboxGroup,
      Checkbox,
      ElInput: Input,
      SelectField,
      PickFlight,
      ButtonEl
    },

    computed: {
      ...mapGetters('security', [
        'internalCheckList',
      ]),
      ...mapGetters('security/form', [
        'form',
      ]),
      value() {
        return this.form[this.field] || {};
      },
      selectedItems: {
        get() {
          return Object.keys(this.value);
        },
        set(vals) {
          const newVal = reduce(
            vals,
            (res, v)=>{
              res[v]=true;
              return res;
            },
            {}
          );
          this[UPDATE_FORM]({[this.field]: newVal});
        }
      },
      notes: {
        get() {
          return this.form[this.field+'_notes']
        },
        set(val) {
          this[UPDATE_FORM]({[this.field+'_notes']: val});
        }
      }
    },
    methods: {
       ...mapMutations('security/form', [
        UPDATE_FORM,
      ]),
    },
    fieldErrors: {
      checkListError: (vm) => "Please check all list"
    },
    validations: {
      selectedItems: {
        checkListError(value) {
          return without(this.checkList.map(c=>c.id), ...value).length == 0;
        },
      },
      notes: {
        required
      }
    },
    watch: {
      aircraftType: function(newVal, oldVal) {
        this[UPDATE_FORM]({ [this.field]: {} });
      }
    }
  };
</script>


<template>
  <div v-if="checkList.length > 0">
    <group :label="`Preflight - ${label} ${aircraftType}`" :validation-data="$v.selectedItems">
      <p class="text-danger">
        By checking each item, you are verifying you have inspected each location for any evidence of tampering, etc</p>
      <el-checkbox-group v-model="selectedItems">
        <div v-for="item in checkList">
          <el-checkbox :label="item.id" :key="item.id">{{item.label}}</el-checkbox>
        </div>
      </el-checkbox-group>
    </group>
    <group label="Addional Notes" :validation-data="$v.notes">
      <el-input type="textarea" placeholder='Record any relevant information in regards to the completed search. If none, write "none".' v-model="notes"></el-input>
    </group>
  </div>
</template>
