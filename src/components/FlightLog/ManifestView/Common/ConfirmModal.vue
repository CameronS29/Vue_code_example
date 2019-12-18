<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { Notification } from 'element-ui';
  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import ButtonEl from 'Common/Button.vue';
  import ManifestProgress from '../../../Dispatch/Common/ManifestProgress.vue';
  import Group from "Common/Form/Group.vue";
  import GroupSplit from "Common/Form/GroupSplit.vue";
  import TextField from "Common/Form/Fields/TextField.vue";
  import GlobalError from "Common/Form/GlobalError.vue";

  import {
    mapFormTextField,
  } from 'store/helpers/forms';
  import {
    UPDATE_APPROVAL_DATA,
  } from 'store/modules/pilotManifest/consts';
  import {required} from 'vuelidate/lib/validators';

  export default {
    components: {
      Modal,
      Card,
      ButtonEl,
      ManifestProgress,
      Group,
      GroupSplit,
      TextField,
      GlobalError,
    },

    computed: {
      ...mapGetters('pilotManifest/confirm', [
        'manifest',
        'isLoaded',
      ]),
      ...mapFormTextField(
        "pilotManifest/confirm/approvalData",
        "pilotManifest/confirm/" + UPDATE_APPROVAL_DATA,
        [
          "pin",
          "initials",
          "created",
        ]
      ),
      isShown() {
        return !!this.manifest.id;
      },

      reportLink() {
        return `/flightlog/pdf-report/${this.manifest.id}/`;
      },
    },

    methods: {
      ...mapActions('pilotManifest/confirm', [
        'picConfirm',
        'confirm',
        'reset',
      ]),
      ...mapActions('pilotManifest', [
        'getStatusLogs'
      ]),
      updateStatus(status) {
        this.confirm(status).then(() => this.getStatusLogs(this.manifest.id))
        .catch((err) => Notification.error({
          title: 'Confirmation Error',
          message: 'Error occurred while confirming manifest',
        }));
      },
      approveManifest() {
        this.$v.$touch();
        if (!this.$v.$error) {
          const {id, number} = this.manifest;
          this.picConfirm()
          .then(()=>{
            this.isApprovalDataValid = true;
            this.$router.push({name: 'pilot_manifest_view', params: {id}});
            this.getStatusLogs(id);
            Notification.success({
              title: 'Approved',
              message: `Manifest #${number} successfully approved`
            })
          })
          .catch((error) => {
            this.isApprovalDataValid = false;
            Notification.error({
              title: 'Pic Confirmatin Error',
              message: "Invalid PIN or initials for selected PIC"
            });
          });
        }
      },
    },
    data() {
      return {
        isApprovalDataValid: true,
      };
    },
    fieldErrors: {
      serverError: () => null,
      globalServerError: () => 'Invalid PIN or initials for selected PIC',
    },
    globalErrors: ['globalServerError'],
    validations: {
      pin: {
        serverError() {
          return this.isApprovalDataValid;
        },
        globalServerError() {
          return this.isApprovalDataValid;
        },
      },
      initials: {
        serverError() {
          return this.isApprovalDataValid;
        },
      },
      created: { required },
    },
    watch: {
      pin() {
        this.$v.$reset();
        this.isApprovalDataValid = true;
      },
      initials() {
        this.$v.$reset();
        this.isApprovalDataValid = true;
      },
    },
  };
</script>

<template>
  <modal :portalled="false" :show="isShown" @close="reset" :show-close="true" transparent>
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
          <hr class="manifest-confirm-modal__delimiter"/>
          <div class="manifest-confirm-modal__actions" v-loading="!isLoaded">
              <button-el @click="updateStatus(2)" label="Send notification for PIC to approve" v-if="manifest.status == 1"
                type="success" rounded  />
              <p v-if="manifest.status == 1">
                OR<br/>Send notification this manifest is completed
                and ready for PIC to PIN
              </p>
            <global-error :validation-data="$v"></global-error>
            <group-split >
              <group label="PIN" :validation-data="$v.pin">
                <text-field v-model="pin" type="password" ></text-field>
              </group>
              <group label="Initials" :validation-data="$v.initials">
                <text-field v-model="initials"></text-field>
              </group>
              <group label="Date" :validation-data="$v.created">
                <text-field v-model="created" disabled></text-field>
              </group>
            </group-split>
            <button-el @click="approveManifest()"
                       label="Complete and PIC PIN" type="success"
                       rounded/>
          </div>

          <div class="manifest-confirm-modal__actions">
            <button-el @click="reset" label="HOME" icon="home" type="dark-blue"
                       rounded/>
          </div>
        </card>
      </div>
    </card>
  </modal>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .manifest-confirm-modal {
    &__card {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      width: 90vw;
      min-height: 80vh;
      color: white;
    }

    &__title {
      margin: 0;
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
      p {
        padding: 15px;
        font-size: 15px;
        color: grey;
        text-align: center;
      }
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
