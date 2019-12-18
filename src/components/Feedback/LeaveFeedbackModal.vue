<script>
  import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
  import { DateTime } from 'luxon';

  import LeaveFeedbackFrom from './LeaveFeedbackModalForm';
  import { SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG } from 'store/modules/feedback';

  export default {
    components: {
      LeaveFeedbackFrom,
    },
    computed: {
      ...mapState('feedback', [
        'isPlainMessageModalShown',
      ]),
      isPlainMessageModal: {
        get() {
          return this.isPlainMessageModalShown;
        },
        set(value) {
          this[SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG](value);
        },
      },
    },
    methods: {
      ...mapActions('feedback', [
        'leaveFeedback',
      ]),
      ...mapMutations('feedback', [
        SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG,
      ]),
    },
  };
</script>

<template>
  <el-dialog :visible.sync="isPlainMessageModal">
    <div class="leave-message-modal-content">
      <leave-feedback-from @submit="$emit('submit')" />
    </div>
  </el-dialog>
</template>

<style lang="scss">
  .leave-message-modal-content {
    width: 600px;
    max-width: 90vw;
    padding: 10px 0 0;
  }
</style>
