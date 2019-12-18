<script>
  import Card from 'Common/Card.vue';
  import Icon from 'Common/Icon.vue';

  export default {
    name: 'ConfirmationSplash',
    props: {
      user: String,
    },
    components: {
      Card,
      Icon,
    },
  };
</script>

<template>
  <card title="Confirmation Procedure" class="wb-detail__confirmation wb-detail__confirmation_modal">
    <icon class="wb-detail__confirmation-mark" glyph="check-circle" size="3x" fixed-width />
    <div class="wb-detail__confirmation-message">
      <strong>{{ user }}</strong> is pinning this log.
      You can't edit it while procedure is in progress.
    </div>
  </card>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .wb-detail {
    &__confirmation {
      width: 320px;
      height: 130px;
      text-align: center;
      box-shadow: 0 0 1px rgba(0, 0, 0, .2);

      opacity: .9;

      & .card__title {
        font-size: 15px;
      }

      & .card__container {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
      }

      &_modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
      }
    }

    &__confirmation-mark {
      display: block;
      margin-right: 10px;
      color: $--color-success;
    }

    &__confirmation-message {
      font-size: 13px;
      text-align: left;
    }

    &__confirmation-break {
      display: inline-block;
    }
  }
</style>
