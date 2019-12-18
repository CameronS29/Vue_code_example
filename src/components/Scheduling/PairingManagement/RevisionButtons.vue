<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { isEmpty } from 'lodash';
  import * as consts from 'store/modules/scheduling/consts';
  import { checkLegality } from 'store/modules/scheduling/revisions';

  import ButtonEl from 'Common/Button.vue';

  export default {
    components: {
      ButtonEl,
    },
    props: {
      monthlyPairingDate: Date,
      tableNamespace: String,
    },
    computed: {
      ...mapGetters('scheduling/revisions', ['activeRevision', 'draftExists', 'hasRevisions']),

      showPublishBtn() {
        return !isEmpty(this.activeRevision) && !this.activeRevision.published;
      },
    },
    methods: {
      ...mapMutations('scheduling/pairings/history', [consts.SET_DRAFT_ADDITION_POPUP_SHOWN]),
      ...mapActions('scheduling/revisions', [
        'getRevisions',
        'createRevision',
        'removeDraft',
        'publishActiveRevision',
      ]),

      async refreshTable() {
        return this.$store.dispatch(`${this.tableNamespace}/refreshResults`);
      },

      handleDraftClick() {
        this[consts.SET_DRAFT_ADDITION_POPUP_SHOWN](true);
      },

      async handleRemoveDraft() {
        await this.$confirm('Do you really want to remove draft?', 'Warning', {
          type: 'warning',
        });

        return this.removeDraft();
      },

      async handlePublishClick() {
        const legality = await checkLegality(this.activeRevision.id);

        if (legality.is_legal) {
          await this.$confirm(`Do you want to publish ${this.activeRevision.version}?`, 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          });
        } else {
          await this.$confirm(`Schedule is illegal. Do you want to publish it anyway?`, 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          });
        }

        this.publishActiveRevision();
        this.$message({
          type: 'success',
          message: 'Revision was published',
        });
      },
    },
  };
</script>

<template>
  <div class="pairing-revision-buttons">
    <button
      icon="calendar"
      class="btn btn-primary pairing-revision-buttons__btn"
      @click="handleDraftClick"
      v-if="hasRevisions && !draftExists"
    >
      Create draft
    </button>

    <button
      class="btn btn-danger pairing-revision-buttons__btn"
      @click="handleRemoveDraft"
      v-if="hasRevisions && !activeRevision.published"
    >
      Delete draft
    </button>

    <button
      class="btn btn-success pairing-revision-buttons__btn"
      @click="handlePublishClick"
      v-if="showPublishBtn"
    >
      Publish #{{ activeRevision.version }}
    </button>
  </div>
</template>


<style lang="scss">
  .pairing-revision-buttons {
    &__btn {
      &:not(:last-of-type) {
        margin-right: 3px;
      }
    }
  }
</style>
