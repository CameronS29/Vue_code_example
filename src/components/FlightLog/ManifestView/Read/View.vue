<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import StatusBlock from '../Common/StatusBlock.vue';
  import ManifestDetailView from './Partials/ManifestDetail.vue';
  import FlightLogs from './Partials/FlightLogs.vue';
  import FireCheck from '../../form/FireCheck.vue';
  import VorCheck from '../../form/VorCheck.vue';
  import HoursTable from '../Common/HoursTable.vue';
  import Inspections from './Partials/Inspections.vue';
  import ManifestLoading from '../ManifestLoading.vue';
  import ManifestConfirmModal from '../../../Dispatch/Common/ManifestConfirmModal.vue';

  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED,
  } from '../../../../store/modules/flightlog/consts';

  export default {
    props: {
      id: Number,
      hideButtons: Boolean,
      backUrl: [String, Object],
    },

    components: {
      ManifestDetailView,
      FlightLogs,
      FireCheck,
      VorCheck,
      HoursTable,
      Inspections,
      StatusBlock,
      ManifestLoading,
      ManifestConfirmModal
    },

    computed: {
      ...mapGetters('pilotManifest', [
        'manifest',
        'inprogress',
      ]),
      isDispatch() {
        return this.$route.name.indexOf('dispatch_') > -1;
      },
      isReopenable() {
        return this.manifest.status == STATUS_COMPLETED || this.manifest.status == STATUS_DISPATCH_PENDING;
      },
      isCompletable() {
        return this.manifest.status == STATUS_DISPATCH_PENDING;
      }
    },
    methods: {
      ...mapActions('dispatch/confirm', {
        setConfirm: 'setManifest',
      }),
      dispatchReopen() {
        this.confirmStatus = 'reopen';
        this.setConfirm(this.manifest);
      },
      completeManifest() {
        this.confirmStatus = 'complete';
        this.setConfirm(this.manifest);
      },
      onDispachReopened() {
        this.$router.push({name: 'dispatch_manifest_edit', params: {id: this.manifest.id}});
      }
    },
    data() {
      return {
        confirmStatus: '',
      };
    },
  };
</script>

<template>
  <div>
    <manifest-confirm-modal @dispachReopened="onDispachReopened" :status="confirmStatus" />
    <status-block></status-block>
    <manifest-detail-view></manifest-detail-view>
    <flight-logs :manifestId="id" :hideButtons="hideButtons"></flight-logs>
    <div class="row">
      <div class="col-md-6">
        <vor-check
          :manifestId="manifest.id"
          :picInitial="manifest.pic_initials"
          :status="manifest.vor_status"
          :objectId="manifest.vor_confirmation"
          :block-edit="true"></vor-check>
      </div>
      <div class="col-md-6">
        <fire-check
          :manifestId="manifest.id"
          :picInitial="manifest.pic_initials"
          :status="manifest.fire_status"
          :objectId="manifest.fire_confirmation"
          :block-edit="true"></fire-check>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <hours-table></hours-table>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-8 col-xs-12">
        <!-- place to status-wideget not required for FSDO app -->
      </div>
      <div class="col-lg-4 col-xs-12">
        <div class="row" style="margin-top: 10px;">
          <div class="col-xs-6">
            <a class="btn btn-dark-blue btn-rounded btn-full-width" target="_blank" :href="`/flightlog/pdf-report/${id}/`">
              <i class="fa fa-file-pdf-o"></i>&nbsp;View PDF
            </a>
          </div>
          <div class="col-xs-6">
            <router-link class="btn btn-dark-blue btn-rounded btn-full-width" :to="backUrl">
              <i class="fa fa-home"></i>&nbsp;Home
            </router-link>
          </div>
        </div>
        <div class="row" style="margin-top: 10px;" v-if="isDispatch">
          <div class="col-xs-12">
            <button class="btn btn-success btn-rounded btn-full-width"
                @click="completeManifest" v-if="isCompletable">
              Approve And Complete
            </button>
            <button class="btn btn-success btn-rounded btn-full-width"
                @click="dispatchReopen" v-if="isReopenable">
              Dispatch Re-Open
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="../../scss/manifestview.scss">
  .manifest-detail-fade {
    &-enter,
    &-leave-to {
      opacity: 0;
    }

    &-enter-to,
    &-leave {
      opacity: 1;
    }

    &-enter-active {
      transition: opacity 150ms ease-in;
    }

    &-leave-active {
      transition: opacity 150ms ease-out;
    }
  }
</style>
