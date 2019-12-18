<script>
  import bowser from 'bowser';
  import { mapActions, mapMutations, mapGetters, mapState } from 'vuex';
  import { PortalTarget } from 'portal-vue';
  import { debounce } from 'lodash';

  import { PopperDispatch } from 'Common/BottomPopper.vue';
  import Icon from 'Common/Icon.vue';
  import Sidebar from './App/Sidebar/Sidebar.vue';
  import SidebarSection from './App/Sidebar/SidebarSection.vue';
  import BottomSection from './App/Sidebar/SidebarBottomSection.vue';
  import MenuItem from './App/Sidebar/MenuItem.vue';
  import CsvDownload from './CsvDownload.vue';

  import UpdateNotification from './App/UpdateNotification.vue';
  import NavigationBar from './App/Header/View.vue';
  import Feedback from './Feedback/Feedback.vue';
  import EnvLabel from './App/EnvLabel.vue';

  const browser = bowser.getParser(window.navigator.userAgent);

  export default {
    name: 'SpaLayout',

    created() {
      document.addEventListener('keyup', this.handleKeyUp);
      document.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('resize', this.handleResize);
    },

    destroyed() {
      document.removeEventListener('keyup', this.handleKeyUp);
      document.removeEventListener('keydown', this.handleKeyDown);
      window.addEventListener('resize', this.handleResize);
    },

    components: {
      UpdateNotification,
      PortalTarget,
      Icon,

      Sidebar,
      SidebarSection,
      BottomSection,
      MenuItem,
      Feedback,

      NavigationBar,
      CsvDownload,
      EnvLabel,
    },

    computed: {
      ...mapGetters('user', [
        'isAdmin',
        'isDispatcher',
        'isPilot',
      ]),
      ...mapGetters('app/sidebar', ['isOpen']),
      ...mapState('app', ['isShiftPressed']),
      classes() {
        return {
          'fltops-app': true,
          'fltops-app_ios': this.isIos,
          'fltops-app_non-user-select': this.isShiftPressed,
        };
      },

      pageStyles() {
        const height = PopperDispatch.placeholderHeight;
        if (height !== 0) {
          return { paddingBottom: `${height}px` };
        }
        return '';
      },

      isIos() {
        return browser.getOSName() === 'iOS';
      },
    },

    methods: {
      ...mapActions('app', ['processShiftPress']),
      ...mapMutations('app', ['setWindowHeight']),
      ...mapActions('app/sidebar', ['toggleMenu', 'hideMenu']),

      handleKeyDown(e) {
        if (e.keyCode === 16) this.processShiftPress(true);
      },

      handleKeyUp(e) {
        if (e.keyCode === 16) this.processShiftPress(false);
      },

      handleResize: debounce(function (e) {
        this.setWindowHeight(window.innerHeight);
      }, 300),
    },
  };
</script>

<template>
  <div :class="classes">
    <env-label />

    <sidebar :show="isOpen" @close="hideMenu">
      <sidebar-section class="fltops-app__logo-section" @click.native="hideMenu">
        <img src="./App/assets/boutique_air_logo_na-only.svg" class="fltops-app__logo" alt="Boutique Air">
        <div class="fltops-app__title-wrapper">
          <h2 class="fltops-app__title">Boutique Air</h2>
          <h3 class="fltops-app__subtitle">FLIGHTOPS</h3>
        </div>
        <span class="fltops-app__fold-icon">&times;</span>
      </sidebar-section>

      <sidebar-section>
        <menu-item label="Pilot Dashboard"
                   :to="{ name: 'pilot_dashboard' }"
                   icon="globe"
                   v-if="isPilot" />
        <menu-item label="Pilot Scheduling" :to="{ name: 'pilot_sched' }" icon="calendar-check-o" v-if="isPilot"/>
        <menu-item label="Dispatch Dashboard" :to="{ name: 'dispatch_landing' }" icon="diamond">
          <menu-item label="Dashboard" :to="{ name: 'dispatch_dashboard' }" />
          <menu-item label="Aircraft Inspections" :to="{ name: 'dispatch_inspections' }" />
          <menu-item label="Elog" :to="{ name: 'dispatch_elog' }" />
          <menu-item label="Synchronization" :to="{ name: 'flight_sync' }" />
          <menu-item label="Add a Flight" href="/dispatch/flight/create/" />
          <menu-item label="View Flight List"
                     :to="{ name: 'dispatch_flight-list' }"
                     classic-link="/dispatch/flight/list/" />
          <menu-item label="Flight Daily View" :to="{ name: 'dispatch_flight-daily' }" />
          <menu-item label="e-Checklist" :to="{ name: 'dispatch_e-checklist' }" />
        </menu-item>
      </sidebar-section>

      <sidebar-section>
        <menu-item label="Flight & Duty Time" :to="{ name: 'fdt_landing' }" icon="briefcase">
          <menu-item label="Crew Calendar" :to="{ name: 'fdt_calendar' }" />
          <menu-item label="Legality Sandbox" :to="{ name: 'fdt_sandbox' }" />
        </menu-item>

        <menu-item label="Scheduling" :to="{ name: 'scheduling_landing' }" icon="calendar-check-o" >
          <menu-item label="Calendar" :to="{ name: 'scheduling_calendar' }" />
          <menu-item label="Gantt" :to="{ name: 'scheduling_gantt' }" />
          <menu-item label="Shift Management" :to="{ name: 'scheduling_pairing_management' }" />
          <menu-item label="Shift Templates" :to="{ name: 'scheduling_pairing_templates' }" />
          <menu-item label="Crew Currency" :to="{ name: 'crew-currency' }" />
        </menu-item>
        <menu-item label="Open Time Requests" :to="{ name: 'open_time_list' }" icon="thumbs-up" />

        <menu-item label="Weight & Balance" :to="{ name: 'wb_landing' }" icon="balance-scale">
          <menu-item label="Dashboard" :to="{ name: 'wb_list' }" />
          <menu-item label="Analytics" :to="{ name: 'wb_full_list' }" />
        </menu-item>

        <menu-item label="MXC" :to="{ name: 'mxc_landing' }" icon="exchange">
          <menu-item label="Dashboard" :to="{ name: 'mxc_dashboard' }" />
          <menu-item label="State history" :to="{ name: 'mxc_state' }" />
          <menu-item label="Engine Management" :to="{ name: 'engine_list' }" />
          <menu-item label="MEL" :to="{ name: 'mel_management' }" />
          <menu-item label="Discrepancy Management" :to="{ name: 'discrepancy_management' }" />
        </menu-item>

        <menu-item label="Maintenance QA" :to="{ name: 'maintenance_qa_dashboard' }" icon="exchange">
          <menu-item label="Dashboard" :to="{ name: 'maintenance_qa_dashboard' }" />
          <menu-item label="State history" :to="{ name: 'maintenance_qa_state' }" />
        </menu-item>

        <menu-item label="FSDO" :to="{ name: 'fsdo_dashboard' }" icon="eye" />

        <menu-item label="Security" :to="{ name: 'security_form' }" icon="shield">
          <menu-item label="Security Search Form" :to="{ name: 'security_form' }" />
          <menu-item label="Security Search Logs" :to="{ name: 'security_dashboard' }" />
        </menu-item>

        <menu-item label="Operations management" :to="{ name: 'op_flight_list' }" icon="play-circle">
          <menu-item label="View Flight List" :to="{ name: 'op_flight_list' }" />
        </menu-item>
      </sidebar-section>

      <sidebar-section>
        <menu-item label="Route Planning" :to="{ name: 'routeplanning_gantt' }" icon="binoculars" />
        <menu-item v-if="isAdmin" label="Avg management" :to="{ name: 'rp_routes' }" icon="binoculars" />
      </sidebar-section>

      <sidebar-section>
        <menu-item label="Reports" :to="{ name: 'report_landing' }" icon="file-text-o">
          <menu-item label="On-Time Performance" :to="{ name: 'report_ontime' }" />
          <menu-item label="Delays" :to="{ name: 'report_delay' }" />
        </menu-item>
      </sidebar-section>

      <bottom-section v-if="isAdmin">
        <menu-item label="Settings" href="/ba_admin/" icon="cogs" />
        <menu-item label="Analytics" :to="{ name: 'tracking' }" icon="area-chart" />
        <menu-item label="Feedback" :to="{ name: 'feedback_list' }" icon="comment-o" />
      </bottom-section>
    </sidebar>

    <navigation-bar @open="toggleMenu" />

    <div class="fltops-app__page" :style="pageStyles">
      <transition name="fltops-app__transition" mode="out-in" appear>
        <router-view />
      </transition>
    </div>

    <portal-target name="modal" multiple />
    <csv-download />

    <portal-target name="notes" />
    <portal-target class="fltops-app__bottom-right-portal" name="bottom-right" multiple />
    <portal-target
      class="fltops-app__bottom-right-portal fltops-app__bottom-right-portal_foreground"
      name="bottom-right-foreground"
      multiple
    />

    <feedback />
    <update-notification />
  </div>
</template>

<style lang="scss" src="./design/scss/element-rewrite.scss"/>
<style lang="scss" src="./Common/scss/form.scss"/>
<style lang="scss">
  /* Style overrides, global scope */
  @import '../../scss/bs-variables';

  .fltops-app .el-loading-mask {
    z-index: $splash-zindex !important;
    opacity: .6;
  }

  .fltops-app {

    &_ios {
      cursor: pointer;
    }

    &_non-user-select {
      user-select: none;

      * {
        user-select: none;
      }
    }

    &__bottom-right-portal {
      position: fixed;
      bottom: 20px;
      right: 10px;
      display: flex;
      flex-flow: column;
      align-items: flex-end;
      z-index: $corner-portal-zindex;

      &_foreground {
        z-index: 3000;
      }

      & > *:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '../../scss/bs-variables';

  .fltops-app {
    min-height: 100%;
    background: $gray;
    display: flex;
    flex-direction: column;

    &__page {
      padding: 0 25px 65px;
      flex: 1;
      display: flex;
      flex-flow: column;

      @media screen and (max-width: $screen-xs-max) {
        padding: 0 15px 65px;
      }

      &::before, &::after {
        display: table;
        content: '';
      }
    }

    &__logo {
      width: 75px;
    }

    &__title {
      font-weight: bold;
      font-size: 22px;
      padding: 0;
      margin: 6px 0;
      opacity: 0.9;
    }

    &__subtitle {
      font-weight: normal;
      font-size: 14px;
      opacity: 0.75;
      padding: 0;
      margin: 0;
    }

    &__logo-section.fltops-sidebar-section {
      cursor: pointer;
      background: darken($black, 5%);
      display: flex;
      flex: 0 0 90px;
      flex-direction: row;
      justify-content: space-between;
      padding: 15px 15px 15px 25px;
    }

    &__fold-icon {
      align-self: center;
      text-align: right;
      font-size: 1.4em;
    }

    &__transition {
      &-enter,
      &-leave-to {
        opacity: 0;
        transform: translateX(20px);
      }

      &-enter-to,
      &-leave {
        opacity: 1;
        transform: translateX(0);
      }

      &-enter-active {
        transition: all 250ms ease-in;
      }

      &-leave-active {
        transition: all 250ms ease-out;
      }
    }
  }
</style>
