<script>
  import {mapGetters, mapActions} from 'vuex';
  import { some, map, cloneDeep } from 'lodash';
  import Icon from 'Common/Icon.vue';

  import { checkRoute } from '../../../utils/permissions';

  export default {
    name: 'MenuItem',

    props: {
      icon: String,
      to: [String, Object],
      href: String,
      label: String,
      classicLink: String,
    },

    components: {
      Icon,
    },

    computed: {
      ...mapGetters('app/sidebar', ['activeItem']),
      ...mapGetters('user', ['user', 'flags']),

      isManaged() {
        return this.to !== undefined;
      },

      linkComponent() {
        return (this.isManaged ? 'router-link' : 'a');
      },

      linkProps() {
        return {
          ...(this.isManaged ? {to: this.to} : {href: this.href}),
          'class': {'sidebar-link_open': this.isOpen},
          event: (this.$slots.default ? '' : 'click'),
        };
      },

      isOpen() {
        return this.$slots.default !== undefined
          && this.checkActivityThree(this);
      },

      isPermitted() {
        const resolver = cloneDeep(this.to);
        if (!resolver) {
          return true;
        }

        const { resolved } = this.$router.resolve(resolver);
        return checkRoute(resolved, this.$store);
      },
    },

    methods: {
      ...mapActions('app/sidebar', [
        'hideMenu',
        'setActiveItem',
      ]),

      handleOpen(e) {
        e.stopPropagation();
        this.setActiveItem(this._uid);

        if (this.$slots.default) {
          e.preventDefault();
        } else {
          this.hideMenu();
        }
      },

      checkActivityThree(el) {
        if (el._uid === this.activeItem) {
          return true;
        }
        return some(map(el.$children, this.checkActivityThree));
      },

      async handleSwitchClassic(e) {
        e.preventDefault();
        e.stopPropagation();

        await this.$tracker.record({
          type: 'click-classic',
          event: { link: this.classicLink },
        });
        window.location.href = this.classicLink;
      },
    },
  };
</script>

<template>
  <component
    v-if="isPermitted"

    :is="linkComponent"
    class="sidebar-link"
    v-bind="linkProps"

    @click.native="handleOpen"
    @click="handleOpen"
  >
    <div class="sidebar-link__head">
      <icon v-if="icon" :glyph="icon" size="lg" class="sidebar-link__icon" fixed-width />
      <span class="sidebar-link__label">
        {{ label }}
        <span class="sidebar-link__label_postfix">
          <slot name="postfix"></slot></span>
        </span>
      <slot name="extra"></slot>
      <span class="label label-info" @click="handleSwitchClassic" v-if="classicLink">
        Use FLTOPS <br>Classic
      </span>
      <icon glyph="angle-left" class="sidebar-link__fold" v-if="this.$slots.default" />
    </div>
    <div class="sidebar-link__sub" v-if="$slots.default">
      <slot/>
    </div>
  </component>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .fltops-sidebar-section > .sidebar-link {
    margin: 0 -15px;

    &:first-child { margin-top: 15px; }
    &:last-child { margin-bottom: 15px; }
  }

  .sidebar-link {
    color: $nav-text-color;
    padding: 10px 20px;
    font-size: 14px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transition: color .15s ease-in-out, background-color .15s ease-in-out;
    cursor: pointer;

    &__head {
      display: flex;
      align-items: center;
      width: 100%;
    }

    &:hover {
      background: lighten($black, 5%);
      color: $light-blue;
    }

    &__sub {
      flex-direction: column;
      width: 100%;

      opacity: .4;
      transform: translateY(-5px);
      transition: opacity .2s ease-in-out, transform .15s ease-in-out;
      max-height: 0;
      overflow: hidden;

      & > .sidebar-link {
        margin: 0 -20px;
        padding: 10px 20px 10px calc(1.28571429em + 45px);
      }
    }

    &__icon {
      margin-right: 20px;
    }

    &__label {
      flex: 1 1 100%;
    }

    &__fold {
      font-size: 16px;
      transition: transform .15s linear;
    }

    &.router-link-active {
      background: darken($black, 5%);
      color: $light-blue;
    }

    &_open, &_open:not(.router-link-active):hover {
      background: darken($black, 3%);
    }

    &.router-link-active,
    &_open {
      transition: color .15s ease-in-out;

      .sidebar-link {
        &__sub {
          opacity: 1;
          transform: translateY(0);
          max-height: initial;
          padding-top: 10px;
          overflow: visible;
        }

        &__fold {
          transform: rotateZ(-90deg);
        }
      }
    }
  }
</style>
