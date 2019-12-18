<script>
  import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
  import html2canvas from 'html2canvas';
  import { DateTime } from 'luxon';
  import { sleep } from 'utils/async';

  import { flag } from '../../utils/permissions';
  import ButtonEl from '../Common/Button';
  import UserInfo from '../../utils/user-info';
  import LeaveFeedbackModal from './LeaveFeedbackModal';
  import {
    SET_SCENARIO_MODAL_SHOW_FLAG,
    SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG,
    SET_NOTES_ADDITION_MODE_FLAG,
    ADD_NOTE,
    REMOVE_NOTE,
    RESET_NOTES,
    TOGGLE_NOTES,
    SET_LOADING,
  } from '../../store/modules/feedback';

  import { dataURItoBlob } from '../../utils/image';

  export const FEEDBACK_ID_QUERY_KEY = 'feedbackRecordId';

  export default {
    components: {
      ButtonEl,
      LeaveFeedbackModal,
    },
    computed: {
      ...mapState('feedback', [
        'activeRecord',
        'isScenarioModalShown',
        'isPlainMessageModalShown',
        'isInNotesAdditionMode',
        'plainMessageForm',
        'notes',
        'loading',
        'showNotes',
      ]),
      feedbackIsHidden() {
        return flag('show_feedback')(this.$store);
      },
      isFeedbackPage() {
        return !!this.$route.query[FEEDBACK_ID_QUERY_KEY];
      },
      isScenarioModal: {
        get() {
          return this.isScenarioModalShown;
        },
        set(value) {
          this[SET_SCENARIO_MODAL_SHOW_FLAG](value);
        },
      },
    },
    methods: {
      ...mapActions('feedback', [
        'leaveFeedback',
        'fetchFeedbackRecord',
      ]),
      ...mapMutations('feedback', [
        SET_SCENARIO_MODAL_SHOW_FLAG,
        SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG,
        SET_NOTES_ADDITION_MODE_FLAG,
        RESET_NOTES,
        ADD_NOTE,
        REMOVE_NOTE,
        TOGGLE_NOTES,
        SET_LOADING,
      ]),
      async getCurrentAppState() {
        let screenShot;
        try {
          screenShot = await this.getBodyScreenShot();
        } catch (e) {
          screenShot = null;
        }

        return {
          created_at: DateTime.local().toISO(),
          user_info: UserInfo,
          state: JSON.stringify(this.$store.state),
          screenShot,
        };
      },
      async getBodyScreenShot() {
        const app = document.querySelector('.fltops-app');

        const canvas = await html2canvas(app, {
          width: app.offsetWidth,
          height: app.offsetHeight,
        });
        return dataURItoBlob(canvas.toDataURL('image/png'));
      },
      handleLeaveFeedbackClick() {
        this[SET_SCENARIO_MODAL_SHOW_FLAG](true);
      },
      async handleApplyFeedbackClick() {
        await this.fetchFeedbackRecord(this.$route.query[FEEDBACK_ID_QUERY_KEY]);
        this.$store.replaceState(JSON.parse(this.activeRecord.state));
      },
      handleLeaveMessageClick() {
        this[SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG](true);
      },
      handleAddNotesClick() {
        this[SET_NOTES_ADDITION_MODE_FLAG](true);
      },
      handleNotesCancelClick() {
        this[SET_NOTES_ADDITION_MODE_FLAG](false);
      },
      async handlePlainFeedbackSubmit() {
        this[SET_LOADING](true);
        this[SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG](false);
        await sleep(500);

        try {
          await this.leaveFeedback({ ...await this.getCurrentAppState(), message: this.plainMessageForm.message });
          await this.showSuccessMsg();
        } catch (e) {
          this.showErrorMsg();
        } finally {
          this[SET_LOADING](false);
        }
      },
      async handleNotesSubmitClick() {
        this[SET_LOADING](true);
        this[SET_NOTES_ADDITION_MODE_FLAG](false);
        try {
          await this.leaveFeedback({ ...await this.getCurrentAppState(), notes: this.notes });
          await this.showSuccessMsg();
        } catch (e) {
          this.showErrorMsg();
        } finally {
          this[SET_LOADING](false);
          this[RESET_NOTES]();
        }
      },
      async handleBodyClick(e) {
        if (
          e.target.parentElement.classList.contains('feedback__note-addition-btns') ||
          e.target.parentElement.classList.contains('note')
        ) {
          return;
        }

        this.removeBodyClickListener();
        e.preventDefault();
        e.stopPropagation();

        this.$prompt('Note:', null, {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
        }).then(({ value }) => {
          this[ADD_NOTE]({
            x: e.pageX,
            y: e.pageY,
            message: value
          });
        }).catch(e => {
          this.$message({
            type: 'info',
            message: 'Note addition canceled'
          });
        }).finally(() => this.addBodyClickListener());
      },
      handleToggleNotesClick() {
        this[TOGGLE_NOTES]();
      },
      handleNoteClick(index) {
        if (!this.isFeedbackPage) this[REMOVE_NOTE](index);
      },
      addBodyClickListener() {
        document.querySelector('.fltops-app').addEventListener('click', this.handleBodyClick, { capture: true });
      },
      removeBodyClickListener() {
        document.querySelector('.fltops-app').removeEventListener('click', this.handleBodyClick, { capture: true });
      },
      getNoteStyles(note) {
        return {
          left: `${note.x - 10}px`,
          top: `${note.y - 10}px`,
        };
      },
      showErrorMsg() {
        return this.$notify({
          type: 'error',
          title: 'Report not saved!',
          message: 'Something went wrong. Please refresh the page and try again.',
        });
      },
      showSuccessMsg() {
        return this.$notify({
          title: 'Success',
          message: 'Your feedback was successfully recorded',
          type: 'success',
        });
      },
    },
    data() {
      return { addNotesMessage: null };
    },
    watch: {
      isInNotesAdditionMode(flag) {
        if (flag) {
          this[RESET_NOTES]();
          this.addBodyClickListener();
          this.addNotesMessage = this.$message({
            type: 'success',
            message: 'Please add notes by clicking on the page',
            duration: 0,
            showClose: true,
          });
        } else {
          this.removeBodyClickListener();
          if (this.addNotesMessage) {
            this.addNotesMessage.close();
            this.addNotesMessage = null;
          }
        }
      },
    },
  };
</script>

<template>
  <div class="feedback">
    <portal to="bottom-right-foreground" :order="100">
      <div class="feedback__note-addition-btns" v-if="isInNotesAdditionMode">
        <button-el @click="handleNotesSubmitClick">Submit</button-el>
        <button-el @click="handleNotesCancelClick">Cancel</button-el>
      </div>
      <div class="feedback__note-addition-btns" v-else-if="isFeedbackPage">
        <button-el @click="handleApplyFeedbackClick">Apply feedback state</button-el>
        <button-el @click="handleToggleNotesClick" v-if="notes.length">Toggle notes</button-el>
      </div>
      <button-el
        v-else-if="feedbackIsHidden"
        class="feedback__leave-btn"
        @click="handleLeaveFeedbackClick"
        title="Bug Report"
        :icon="{ glyph: loading ? 'spinner' : 'bug', spin: loading }"
      >Bug Report
      </button-el>
    </portal>
    <portal to="bottom-right" :order="100">
      <div
        v-if="feedbackIsHidden"
        class="feedback__btn-placeholder" />
    </portal>

    <el-dialog :visible.sync="isScenarioModal">
      <div class="pick-scenario-modal-content">
        <p class="pick-scenario-modal-content__message">
          Do you want to highlight specific problems on a page or just leave general description of what is wrong?
        </p>
        <div class="pick-scenario-modal-content__buttons">
          <button-el @click="handleLeaveMessageClick">Leave message</button-el>
          <button-el @click="handleAddNotesClick">Add notes</button-el>
        </div>
      </div>
    </el-dialog>
    <leave-feedback-modal @submit="handlePlainFeedbackSubmit" />
    <portal to="notes">
      <div class="note" v-if="showNotes" :key="index" :style="getNoteStyles(note)" v-for="(note, index) in notes">
        <el-tooltip class="item" effect="dark" :content="isFeedbackPage ? note.message : 'Remove'"
                    placement="top-start">
          <span @click="handleNoteClick(index)">{{index + 1}}</span>
        </el-tooltip>
      </div>
    </portal>
  </div>
</template>

<style lang="scss" scoped>
  .feedback {

    &__btn-placeholder {
      height: 34px;
    }

    &__leave-btn {
      opacity: .5;
      transition: .3s;
      &:hover {
        opacity: 1;
      }
    }
  }

  .pick-scenario-modal-content {
    display: flex;
    flex-flow: row wrap;
    max-width: 400px;
    padding: 10px;
    &__message {
      flex: 1 1 100%;
      margin-bottom: 20px;
    }
    &__buttons {
      flex: 1 1 100%;
      justify-content: flex-end;
      display: flex;
      .btn:not(:last-of-type) {
        margin-right: 5px;
      }
    }
  }

  .note {
    position: absolute;
    height: 28px;
    width: 28px;
    z-index: 3100;

    span {
      display: block;
      line-height: 24px;
      border: 2px solid #fff;
      border-radius: 100%;
      background: #fe6c6f;
      text-align: center;
      color: #fff;
      box-shadow: 1px 1px 10px rgba(0, 0, 0, .2);
      cursor: pointer;
    }
  }
</style>
