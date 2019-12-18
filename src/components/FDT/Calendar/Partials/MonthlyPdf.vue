<script>
  import { mapGetters, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { padStart } from 'lodash';
  import Group from "Common/Form/Group.vue";
  import VerticalForm from "Common/Form/VerticalForm.vue";
  import TextField from "Common/Form/Fields/TextField.vue";
  import Tag from 'element-ui/lib/tag';
  import Dialog from 'element-ui/lib/dialog';
  import {required, requiredIf} from 'vuelidate/lib/validators';

  export default {
    data() {
      return {
        dialogVisible: false,
        pin: '',
        initials: '',
        submitting: false
      };
    },
    components: {
      Tag,
      Dialog,
      TextField,
      VerticalForm,
      Group,
    },
    name: 'MontlyPdf',
    computed: {
      ...mapGetters('fdt/legality', [
        'confirmed',
        'isLoading'
      ]),
      tagType() {
        return this.confirmed ? 'danger' : 'success';
      },
      status() {
        return this.confirmed ? 'Completed' : 'Open';
      },
      isReady() {
        const {month, year, pilotId} = this.$route.params;
        return month && year && pilotId;
      },
      monthName() {
        const { month, year } = this.$route.params;
        const monthStr = padStart(`${month}`, 2, '0');
        return DateTime.fromISO(`${year}-${monthStr}-01T00:00:00`).toFormat('LLL');
      },
      pdfUrl() {
        const {month, year, pilotId} = this.$route.params;
        return `/fdt/pdf/${month}/${year}/${pilotId}/`;
      }
    },
    methods: {
      ...mapActions('fdt/legality', [
        'confirm',
        'reopen',
      ]),
      handleReopen() {
        const {month, year, pilotId} = this.$route.params;
        this.submitting = true;
        this.reopen({month, year, pilot: pilotId})
          .then(()=>{
            this.$notify.success({
              title: 'Success',
              message: 'Successfully reopened!'
            });
            this.dialogVisible=false;
          }).catch(()=>{
            this.$notify.error({
              title: 'Error',
              message: "Server Error!"
            });
          }).finally(()=>this.submitting=false);
      },
      handleConfirm() {
        this.$v.$touch();
        if (!this.$v.$invalid) {
          const {month, year, pilotId} = this.$route.params;
          const {pin, initials} = this;
          const that = this;
          this.submitting = true;
          this.confirm({month, year, pin, initials, pilot:pilotId})
            .then(()=>{
              this.$notify.success({
                title: 'Success',
                message: 'Successfully completed!'
              });
              this.dialogVisible=false;
            })
            .catch(()=>{
              this.$notify.error({
                title: 'Error',
                message: 'Invalid initials or PIN!'
              });
            }).finally(()=>this.submitting=false);

        };
      }
    },
    validations: {
      initials: { required },
      pin: { required },
    },
  };
</script>

<template>
  <div>
    <div class="fd-monthly-pdf" v-if="isReady && !isLoading">
      {{ monthName }}&nbsp;&nbsp; 128
      &nbsp;&nbsp;
      <tag :type="tagType" size="small">{{ status }}</tag>
      &nbsp;&nbsp;
      <a target="_blank" title="View Monthly PDF" :href="pdfUrl" class="btn btn-default btn-xs">
        <i class="fa fa-file-pdf-o"></i>
      </a>
      &nbsp;&nbsp;
      <el-button type="primary" @click="dialogVisible = true" size="mini" v-if="!confirmed">Complete</el-button>
      <el-button type="danger" :loading="submitting" @click="handleReopen" size="mini" v-if="confirmed">Reopen</el-button>
    </div>

    <el-dialog
      title="Complete"
      :visible.sync="dialogVisible"
      width="30%">
      <vertical-form>
        <group label="Initials" :validation-data="$v.initials">
          <text-field v-model="initials" />
        </group>
        <group label="Pin" :validation-data="$v.pin">
          <text-field v-model="pin" type="password" />
        </group>
      </vertical-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleConfirm">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss">
  .fd-monthly-pdf {
    background: white;
    margin: 0 0 5px 5px;
    display: inline-block;
    padding: 3px 15px;
    font-size: 12px;
    font-weight: 800;
  }
</style>
