<script>
  import times from 'lodash/times';
  import Avatar from './Avatar.vue';

  export default {
    props: {
      users: {
        type: Array,
        default: () => ([]),
      },
    },

    components: {
      Avatar,
    },

    computed: {
      computedWidth() {
        const itemWidth = 50;
        const margins = 13;
        return Math.min((itemWidth + margins) * this.users.length, 280);
      },
    },
  };
</script>

<template>
  <transition-group
    tag="div"
    class="active-users"
    name="wb-user-avatar-transition"
    :style="{ width: `${computedWidth}px` }"
  >
    <avatar
      v-for="user in users"
      :key="user.id"
      :name="user.first_name"
      :surname="user.last_name"
      :photo="user.avatar"
    />
  </transition-group>
</template>

<style lang="scss">
  .active-users {
    height: 70px;
    width: 0;
    padding: 10px 35px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    background: #fcfcfc;
    border-radius: 3px;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
    z-index: 2000;

    transition: width 500ms;
  }


  .wb-user-avatar-transition {
    &-enter-active, &-leave-active {
      transition: all 500ms;
    }

    &-enter, &-leave-to {
      opacity: 0;
      width: 0 !important;
      transform: translateY(30px);
    }
  }
</style>
