<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import * as consts from 'store/modules/scheduling/consts';
  import Icon from 'Common/Icon.vue';

  import DraftAdditionPopup from './DraftAdditionPopup.vue';

  export default {
    components: {
      DraftAdditionPopup,
      Icon,
    },

    props: {
      editable: {
        type: Boolean,
        default: true,
      },
    },

    computed: {
      ...mapState('scheduling/calendar/history', [
        'draftRevision',
        'draftAdditionPopupShown',
      ]),
      ...mapState('scheduling/calendar', [
        'year',
        'month',
      ]),
      ...mapGetters('scheduling/calendar', [
        'formattedUTCDate',
      ]),
      ...mapGetters('scheduling/revisions', {
        revisions: 'sortedRevisions',
      }),
      ...mapGetters('scheduling/calendar/pilotGrid', ['illegalScheduledPilots']),
      ...mapGetters('scheduling/revisions', [
        'activeRevision',
        'lastRevision',
        'hasInitial',
      ]),
      ...mapGetters('user', ['isAdmin']),
    },

    methods: {
      ...mapMutations('scheduling/revisions', [consts.SET_ACTIVE_REVISION]),
      ...mapMutations('scheduling/calendar/history', [consts.SET_DRAFT_ADDITION_POPUP_SHOWN]),
      ...mapActions('scheduling/revisions', [
        'getRevisions',
        'createRevision',
        'removeDraft',
        'publishActiveRevision',
        'setInitialMonthRevision',
        'unsetInitialMonthRevision',
      ]),

      handleDraftClick() {
        this[consts.SET_DRAFT_ADDITION_POPUP_SHOWN](true);
      },
      async handlePublishClick() {
        if (this.illegalScheduledPilots.length) {
          const pilotNames = this.illegalScheduledPilots
          .map(pilot => `${pilot.pilot.first_name} ${pilot.pilot.last_name}`);

          await this.$confirm(`Schedule for ${pilotNames.join(', ')} is illegal.
          Do you want to publish it anyway?`, 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          });
        } else {
          await this.$confirm(`Do you want to publish ${this.activeRevision.version}?`, 'Warning', {
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

      handleRevisionClick(id) {
        this[consts.SET_ACTIVE_REVISION](id);
      },

      async handleRemoveDraft() {
        await this.$confirm('Do you really want to remove draft?', 'Warning', {
          type: 'warning',
        });
        this.removeDraft();
      },

      handleSetInitialClick() {
        return this.setInitialMonthRevision(this.activeRevision);
      },

      handleUnsetInitialClick() {
        return this.unsetInitialMonthRevision(this.activeRevision);
      },
    },
  };
</script>

<template>
  <div class="revision-list">
    <el-select
      :value="activeRevision.id"
      @input="handleRevisionClick"
      size="small"
      class="revision-list__dropdown"
      placeholder="Revision">
      <el-option v-for="revision in revisions"
                 :key="revision.id"
                 :label="`${formattedUTCDate} revision ${revision.version} ${revision.published ? '' : '(Draft)'}`"
                 :value="revision.id">
        <div class="revision-list__list-item">
          {{ formattedUTCDate }} revision {{ revision.version }} {{ revision.published ? '' : '(Draft)' }}
          <el-tag class="revision-list__initial-tag"
                  v-if="revision.initial"
                  size="mini">
            initial
          </el-tag>
        </div>
      </el-option>
    </el-select>

    <div v-if="editable">
      <el-button-group v-if="!activeRevision.published">
        <el-tooltip
          content="Publish Revision"
          placement="bottom">
          <el-button
            @click="handlePublishClick"
            type="primary"
            class="revision-list__button"
            size="small">
            <icon glyph="calendar-check-o" />
          </el-button>
        </el-tooltip>

        <el-tooltip v-if="activeRevision.initial && isAdmin"
                    content="Unset Initial Revision (Admin Only)"
                    placement="bottom">
          <el-button
            @click="handleUnsetInitialClick"
            type="danger"
            class="revision-list__button"
            size="small">
            <icon glyph="info" />
          </el-button>
        </el-tooltip>

        <el-tooltip
          content="Delete Draft"
          placement="bottom">
          <el-button
            @click="handleRemoveDraft"
            type="danger"
            class="revision-list__button"
            size="small">
            <icon glyph="trash" />
          </el-button>
        </el-tooltip>
      </el-button-group>

      <el-button-group v-else>
        <el-tooltip content="Add Draft" placement="bottom">
          <el-button
            @click="handleDraftClick"
            type="primary"
            class="revision-list__button"
            size="small">
            <icon glyph="plus" />
            draft
          </el-button>
        </el-tooltip>

        <el-tooltip v-if="!hasInitial" content="Set Initial Revision" placement="bottom">
          <el-button
            @click="handleSetInitialClick"
            type="warning"
            class="revision-list__button"
            size="small">
            <icon glyph="info" />
          </el-button>
        </el-tooltip>

        <el-tooltip v-else-if="activeRevision.initial && isAdmin"
                    content="Unset Initial Revision (Admin Only)"
                    placement="bottom">
          <el-button
            @click="handleUnsetInitialClick"
            type="danger"
            class="revision-list__button"
            size="small">
            <icon glyph="info" />
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>

    <draft-addition-popup
      v-if="draftAdditionPopupShown"
      :year="year"
      :month="month" />
  </div>
</template>

<style lang="scss" scoped>
  @import '../../../../../scss/bs-variables';

  .revision-list {
    display: flex;
    margin: 0 20px 0 0;

    &__dropdown {
      width: 180px;
      margin-right: 10px;
    }

    &__button {
      margin: 1px 0 0;
      height: 30px;
    }

    &__initial-tag {
      line-height: 19px !important;
    }

    &__list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
