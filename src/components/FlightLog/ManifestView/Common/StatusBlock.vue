<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';

  import StatusLogs from './StatusLogs.vue';
  import Comments from './Comments.vue';
  import NumberChangeModal from './NumberChangeModal.vue';
  import Card from "Common/Card.vue";
  import {SET_NUMBER_CHANGE_MODAL} from 'store/modules/pilotManifest/consts';

  const statusTexts = {
    1: 'Open',
    2: 'Pending PIC',
    3: 'Dispatch Pending',
    4: 'Dispatch Re-Open',
    5: 'Completed'
  };

  export default {
    computed: {
      ...mapGetters('pilotManifest', [
        'manifest',
        'statusLogs'
      ]),
      ...mapGetters('user', [
        'isDispatcher'
      ]),
      statusText() {
        return statusTexts[this.manifest.status];
      },
      numberChangable() {
        return this.$route.name.indexOf('_edit') > -1 && (
          this.manifest.status <= 2 || this.isDispatcher
        );
      },
      oldAppLink() {
        let link = '';
        const {manifest} = this;

        switch(this.$route.name) {
          case 'pilot_manifest_edit':
            link = `/flightlog/manifest/${manifest.id}/edit`;
            break;
          case 'pilot_manifest_view':
            link = `/flightlog/manifest/${manifest.id}/view`;
            break;
          case 'dispatch_manifest_edit':
            link = `/dispatch/manifest/${manifest.id}/edit`;
            break;
          case 'dispatch_manifest_view':
            link = `/dispatch/manifest/${manifest.id}/view`;
            break;
        }

        return link;
      }
    },
    components: {
      Comments,
      NumberChangeModal,
      Card,
      StatusLogs
    },
    methods: {
      ...mapMutations('pilotManifest', [
        SET_NUMBER_CHANGE_MODAL,
      ]),
      showModal() {
        this[SET_NUMBER_CHANGE_MODAL](true);
      }
    }
  };
</script>

<template>
  <card>
    <number-change-modal/>
    <div class="manifest-status">
      <status-logs class="manifest-status__comments" :logs="statusLogs"></status-logs>
      <div class="manifest-status__text">
        <div class="manifest-status__label">Manifest Status:
          <span v-if="manifest.status <= 2"
                class="text-success">
                  {{statusText}}&nbsp;<i class="fa fa-file-text"></i>
              </span>
          <span v-if="manifest.status > 2"
                class="text-danger">
                {{statusText}}&nbsp;<i class="fa fa-check-circle"></i>
              </span>
        </div>

        <div id="manifest-number-container" class="manifest-status__number">
          <h1>Flight Manifest #{{manifest.number}}
            <button class="btn btn-primary btn-xs" v-if="numberChangable"
                    @click="showModal"
            >
              <i class="fa fa-pencil"></i>
            </button>
          </h1>
        </div>
      </div>
      <div class="manifest-status__spacer">
      </div>
    </div>
  </card>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

.manifest-status {
  padding-top: 15px;
  display: flex;
  flex-flow: row nowrap;
  color: #676a6c;
  &__text {
    flex: 1 0;
    text-align: center;
    h1 {
      margin: 0;
      line-height: 1.2;
      .btn {
        position: relative;
        top: -3px;
      }
    }
  }
  &__label {
    margin-bottom: 10px;
  }
  &__comments {
    flex: 1 0;
  }
  &__spacer {
    flex: 1 0;
    text-align: right;
  }
  &__old-version-link {
    display: inline-block;
  }
  @media screen and (max-width: $screen-xs-max) {
    flex-flow: column;
    &__spacer {
      flex: 1 1;
      text-align: center;
      order: -2;
      margin-bottom: 10px;
    }
    &__label {
      margin-bottom: 0;
    }
  }
}
</style>
