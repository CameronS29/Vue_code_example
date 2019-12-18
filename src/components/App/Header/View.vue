<script>
  import { mapGetters, mapActions } from 'vuex';

  import Navigation from './Navigation/View.vue';
  import ButtonEl from 'Common/Button.vue';
  import UserMenu from './UserMenu.vue';

  export default {
    name: 'Header',

    components: {
      Navigation,
      ButtonEl,
      UserMenu,
    },

    computed: mapGetters('user', ['user']),
  };
</script>

<template>
  <div class="fltops-navigation">
    <button-el class="fltops-navigation__toggler" @click="$emit('open')" icon="bars" />
    <navigation />

    <div class="fltops-navigation__portal">
      <portal-target name="header" slim />
    </div>
    <user-menu :user="user" />
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .fltops-navigation {
    display: flex;
    padding: 10px 25px;
    align-items: center;
    height: 70px;

    @media screen and (max-width: $screen-xs-max) {
      padding: 10px 15px;
      height: 60px;
    }

    &__toggler {
      flex: 0 0 42px;
      align-self: center;
      font-size: 16px;
      margin: 0 20px 0 0;
      padding: 4px 6px;
    }

    &__portal {
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      flex: 1;
      min-width: 1px;
      margin-left: auto;

      @media screen and (max-width: $screen-xs-max) {
        padding: 0;
      }
    }
  }
</style>
