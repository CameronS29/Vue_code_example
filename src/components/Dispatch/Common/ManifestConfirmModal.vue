<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { Notification } from 'element-ui';
  import { SET_COMMENT } from '../../../store/modules/dispatch/confirm';

  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import ButtonEl from 'Common/Button.vue';
  import ManifestProgress from './ManifestProgress.vue';
  import StateHistoryResultTable from '../../MXC/State/ResultTable.vue'

  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED,
  } from 'store/modules/flightlog/consts';

  export default {
    props: {
      status: String
    },
    components: {
      Modal,
      Card,
      ButtonEl,
      ManifestProgress,
      StateHistoryResultTable,
    },

    computed: {
      ...mapGetters('wb', [
        'airCraftByTailNumber',
      ]),
      ...mapGetters('dispatch/confirm', [
        'manifest',
        'comment',
        'isLoaded',
      ]),

      isShown() {
        return !!this.manifest.id;
      },

      reportLink() {
        return `/flightlog/pdf-report/${this.manifest.id}/`;
      },

      dispatchComment: {
        get() {
          return this.comment;
        },
        set(value) {
          this[SET_COMMENT](value);
        },
      },
      relatedAircraftId() {
        const relatedAircraft = this.airCraftByTailNumber(this.manifest.tail_number || this.manifest.aircraft_name)
        if (relatedAircraft) return relatedAircraft.id
      },
      completable() {
        return this.status == 'complete' || (this.manifest.status == STATUS_DISPATCH_PENDING && !this.status);
      },
      reopenable() {
        return this.status == 'reopen' ||
          (!this.status && (this.manifest.status == STATUS_COMPLETED || this.manifest.status == STATUS_DISPATCH_PENDING));
      },
      sendable() {
        return this.status == 'send' || (!this.status && this.manifest.status == STATUS_DISPATCH_RE_OPEN);
      }
    },

    methods: {
      ...mapActions('dispatch/confirm', [
        'confirm',
        'reset',
      ]),
      ...mapActions('pilotManifest', [
        'getStatusLogs'
      ]),
      ...mapMutations('dispatch/confirm', [
        SET_COMMENT,
      ]),

      updateStatus(status) {
        this.confirm(status).catch(() => Notification.error({
          title: 'Confirmation Error',
          message: 'Error occurred while confirming manifest',
        })).finally(()=> {
          this.getStatusLogs(this.manifest.id);
          if (status == 4) {
            this.$emit('dispachReopened');
          }
        })
      },
    },
  };
</script>

<template>
  <modal :show="isShown" @close="reset" :show-close="false" transparent>
    <card mode="dark" class="manifest-confirm-modal__card">
      <h2 slot="title" class="manifest-confirm-modal__title">
        Flight Manifest #{{ manifest.number }}
      </h2>

      <div class="manifest-confirm-modal__content">
        <div class="manifest-confirm-modal__pdf-report">
          <object
            class="manifest-confirm-modal__pdf-report-object"
            :data="`${reportLink}#toolbar=0&navpanes=0&view=Fit&zoom=100`"
            type="application/pdf"
            width="100%"
            height="auto"
            internalinstanceid="64"
          >
            <p>It appears you don't have a PDF plugin for this browser.
              <br> No biggie... you can
              <a :href="reportLink">click here to download the PDF file.</a>
            </p>
          </object>
        </div>

        <card class="manifest-confirm-modal__status">
          <h3 slot="title" class="manifest-confirm-modal__title">Status of
            Flight Manifest</h3>
          <manifest-progress :status="manifest.status"/>
          <textarea
            v-model="dispatchComment"
            class="form-control manifest-confirm-modal__comments"
            placeholder="Please type corrections request for pilots"
            rows="3" v-if="reopenable || sendable"
          />

          <hr class="manifest-confirm-modal__delimiter"/>
          <div class="manifest-confirm-modal__actions" v-loading="!isLoaded">
            <button-el @click="updateStatus(5)" label="Approve and Complete"
                       type="success" rounded v-if="completable" />
            <button-el @click="updateStatus(2)" label="Send for PIN PIC"
                       type="success" rounded v-if="sendable" />
            <button-el @click="updateStatus(4)" v-if="reopenable"
                       label="Dispatch Re-Open to Edit" type="success"
                       rounded/>
          </div>

          <div class="manifest-confirm-modal__actions">
            <button-el @click="reset" label="HOME" icon="home" type="dark-blue"
                       rounded/>
          </div>
        </card>
        <div class="manifest-confirm-modal__state-history">
          <state-history-result-table
            :aircraft="relatedAircraftId"
            :showPagination="false"
          />
        </div>
      </div>
    </card>
  </modal>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .manifest-confirm-modal {
    &__card {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      width: 90vw;
      min-height: 80vh;
      color: white;
    }

    &__title {
      margin: 15px 0 0;
      font-weight: bold;
      font-size: 24px;
    }

    &__content {
      display: flex;
      justify-content: stretch;
      align-items: flex-start;
      margin-top: 15px;
      height: 100%;

      flex-flow: row wrap;
    }

    &__comments {
      resize: vertical;
    }

    &__actions {
      display: flex;
      flex-direction: column;

      .btn {
        margin-top: 15px;
      }
    }

    &__pdf-report {
      flex: 1 1 calc(65% - 15px);
      margin-right: 15px;
      display: flex;
      align-items: stretch;
      align-self: stretch;
    }

    &__pdf-report-object {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      height: 75vh;
    }

    &__status {
      flex: 1 1 35%;
      color: black;

      .manifest-confirm-modal {
        &__title {
          font-size: 18px;
          padding-bottom: 15px;
        }
      }
    }

    &__delimiter {
      margin-bottom: 5px;
    }

    &__loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      width: 60%;
      height: 70%;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      border-color: $light-gray;
    }

    &__loader-text {
      margin-top: 15px;
    }

    &__state-history {
      flex: 0 0 100%;
      overflow: hidden;
    }

    @media screen and (max-width: $screen-md-max) {
      &__content {
        flex-wrap: wrap;
      }

      &__pdf-report {
        margin-right: 0;
        margin-bottom: 15px;
      }

      &__pdf-report-object {
        height: auto;
      }

      &__pdf-report,
      &__status {
        flex: 1 1 100%;
      }
    }
  }
</style>
