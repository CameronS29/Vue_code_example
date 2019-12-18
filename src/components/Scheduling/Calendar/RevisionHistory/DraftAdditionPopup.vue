<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { last } from 'lodash';
  import * as consts from 'store/modules/scheduling/consts';
  import Modal from 'Common/Modal.vue';

  export default {
    mounted() {
      this.setLastRevisionAsDefault();
    },
    components: {
      Modal,
    },
    props: {
      year: Number,
      month: Number,
    },
    computed: {
      ...mapState('scheduling/calendar/history', [
        'draftRevisionId',
        'draftAdditionPopupShown',
      ]),
      ...mapGetters('scheduling/calendar/history', [
        'draftRevision',
      ]),
      ...mapGetters('scheduling/revisions', {
        revisions: 'sortedPublished',
      }),
    },
    methods: {
      ...mapMutations('scheduling/calendar/history', [
        consts.SET_DRAFT_REVISION,
        consts.SET_DRAFT_ADDITION_POPUP_SHOWN,
      ]),

      ...mapActions('scheduling/revisions', [
        'createRevision',
      ]),

      handleCloseModal() {
        this[consts.SET_DRAFT_ADDITION_POPUP_SHOWN](false);
      },

      handleChangeRevision(value) {
        this[consts.SET_DRAFT_REVISION](value);
      },

      async submit() {
        const { year, month } = this;
        await this.createRevision({
          year,
          month,
          based_on: this.draftRevision.id,
        });

        this[consts.SET_DRAFT_ADDITION_POPUP_SHOWN](false);
      },

      setLastRevisionAsDefault() {
        if (this.draftAdditionPopupShown && this.revisions.length) {
          this[consts.SET_DRAFT_REVISION](last(this.revisions).id);
        }
      },
    },
    watch: {
      draftAdditionPopupShown() {
        this.setLastRevisionAsDefault();
      },
    },
  };
</script>

<template>
  <modal
    :show="draftAdditionPopupShown"
    class="draft-addition-popup"
    @close="handleCloseModal">
    <div class="draft-addition-popup__content">
      <h3 class="draft-addition-popup__header">New Draft</h3>
      <p>Create new draft from revision</p>
      <el-select
        :value="draftRevisionId"
        placeholder="Select revision"
        @input="handleChangeRevision">
        <el-option
          v-for="revision in revisions"
          :key="revision.id"
          :value=" revision.id"
          :label="`Revision #${revision.version}`"/>
      </el-select>

      <div class="draft-addition-popup__btns">
        <el-button
          size="small"
          @click="handleCloseModal">Cancel
        </el-button>

        <el-button
          type="primary"
          size="small"
          :disabled="!draftRevisionId"
          @click="submit">Ok
        </el-button>
      </div>
    </div>
  </modal>
</template>

<style lang="scss">
  .draft-addition-popup {
    &__content {
      padding: 10px;
    }
    &__header {
      margin-bottom: 20px;
    }
    &__btns {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
</style>
