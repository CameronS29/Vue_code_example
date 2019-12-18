<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { SET_TEXT } from "../../../../../store/modules/wb/comments";

  import Comment from "./Comment.vue";

  export default {
    props: {
      disabled: Boolean,
    },

    components: {
      Comment,
    },

    created() {
      this.getComments();
    },

    computed: {
      ...mapGetters("wb/comments", [
        "comment",
        "comments",
      ]),

      text: {
        get() {
          return this.comment.text;
        },
        set(value) {
          this[SET_TEXT](value);
        }
      }
    },

    methods: {
      ...mapActions("wb/comments", [
        "getComments",
        "pushComment",
      ]),
      ...mapMutations("wb/comments", [
        SET_TEXT
      ]),
      submit() {
        this.pushComment();
      }
    },
  };
</script>

<template>
  <div class="wb-comments">
    <div v-for="comment in comments">
      <comment :comment="comment"></comment>
    </div>
    <div class="add-comment">
      <div class="input-wrap">
        <input type="text" v-model="text" placeholder="Add comment" :disabled="disabled">
        <button @click="submit" :disabled="disabled">
          <i class="fa fa-arrow-up" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .wb-comments {
    background: #fff;
    width: 100%;
    padding: 15px 20px;
    margin-bottom: 15px;
    .comment {
      margin-bottom: 10px;
    }
    .bubble {
      display: inline-block;
      position: relative;
      padding: 5px 15px;
      background: #E5E5EA;
      border-radius: 25px;
      color: black;
      margin-bottom: 5px;
      &:before {
        content: "";
        position: absolute;
        z-index: 2;
        bottom: -2px;
        left: -7px;
        height: 20px;
        border-left: 20px solid #E5E5EA;
        border-bottom-right-radius: 16px 14px;
        -webkit-transform: translate(0, -2px);
      }

      &:after {
        content: "";
        position: absolute;
        z-index: 3;
        bottom: -2px;
        left: 21px;
        width: 10px;
        height: 20px;
        background: white;
        border-bottom-right-radius: 10px;
        -webkit-transform: translate(-30px, -2px);
      }
      &.me {
        background: #1ab394;
        color: #fff;

        &:before {
          border-left-color: #1ab394;
        }
      }
    }
    .add-comment {
      .input-wrap {
        width: 200px;
        position: relative;
      }
      button {
        position: absolute;
        right: 5px;
        background: #1ab394;
        color: #fff;
        border-radius: 25px;
        width: 25px;
        height: 25px;
        border: 0;
        top: 5px;
      }
      input {
        width: 100%;
        border-radius: 15px;
        border: 1px solid #ddd;
        font-size: 16px;
        padding: 5px 10px;
        &:focus {
          outline: 0;
        }
      }
    }
  }
</style>
