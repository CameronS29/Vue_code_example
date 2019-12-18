<script>
  import Icon from 'Common/Icon.vue';

  export default {
    name: 'UserMenu',

    props: {
      user: {
        type: Object,
        required: true,
      },
    },

    data() {
      return {
        isOpen: false,
      };
    },

    created() {
      window.addEventListener('click', this.closeDropdown);
    },

    destroyed() {
      window.removeEventListener('click', this.closeDropdown);
    },

    components: {
      Icon,
    },

    methods: {
      toggleDropdown() {
        this.isOpen = !this.isOpen;
      },

      closeDropdown() {
        this.isOpen = false;
      },
    },
  };
</script>

<template>
  <div class="fltops-user-menu">
    <div class="fltops-user-menu__avatar-wrapper" @click.stop="toggleDropdown">
      <div class="fltops-user-menu__avatar">
        <img :src="user.avatar" class="fltops-user-menu__userpic" />
      </div>
    </div>

    <transition name="fltops-user-menu__fold-transition" appear>
      <div v-if="isOpen" class="fltops-user-menu__dropdown fltops-user-settings" @click.stop>
        <ul class="fltops-user-settings__section">
          <li class="fltops-user-settings__item fltops-user-settings__full-name">
            {{ user.first_name }} {{ user.last_name }}
          </li>
          <li class="fltops-user-settings__item fltops-user-settings__email">
            {{ user.email }}
          </li>
        </ul>
        <ul class="fltops-user-settings__section fltops-user-settings__section_actions">
          <li class="fltops-user-settings__item">
            <a :href="`/photo/${user.id}/edit`">Edit Profile</a>
          </li>
          <li class="fltops-user-settings__item fltops-user-settings__email">
            <a href="/account/logout/">Logout</a>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';
  $border-color: lighten($dark-gray, 10%);

  .fltops-user-menu {
    flex: 0 0 auto;
    align-self: center;
    position: relative;

    &__avatar-wrapper {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    &__avatar {
      overflow: hidden;
      height: 40px;
      width: 40px;
      border-radius: 50%;
      background: darken(white, 1%);
    }

    &__userpic {
      object-fit: cover;
      height: 100%;
    }

    &__dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      z-index: $userpic-dropdown-zindex;

      margin-top: 10px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
      border: 1px solid $border-color;

      transform-origin: top center;
    }

    &__fold-transition {
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: translateY(-10px);
      }

      &-enter-to,
      &-leave {
        opacity: 1;
        transform: translateY(0);
      }

      &-enter-active {
        transition: all .2s ease-in-out;
      }

      &-leave-active {
        transition: all .2s ease-out;
      }
    }
  }

  .fltops-user-settings {
    &__section {
      border-bottom: 1px solid $border-color;
      padding: 10px;
      margin-bottom: 0;

      &:last-child {
        border-bottom: none;
      }

      &_actions {
        padding: 5px;

        .fltops-user-settings {
          &__item {
            padding: 5px;
            font-size: 14px;
            border-radius: 2px;
            cursor: pointer;

            &:hover {
              background: transparentize($navy, .9);
            }

            a {
              display: block;
              height: 100%;
              text-decoration: none;
              color: $text-color;

              &:active, &:visited, &:focus {
                color: $text-color;
                text-decoration: none;
              }
            }
          }
        }
      }
    }

    &__item {
      list-style: none;
    }

    &__full-name {
      color: black;
      font-weight: bold;
      font-size: 16px;
    }

    &__email {
      opacity: 0.8;
    }
  }
</style>
