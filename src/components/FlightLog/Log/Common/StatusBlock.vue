<script>
  import {mapGetters, mapActions} from 'vuex';

  export default {
    computed: {
      ...mapGetters('flightlog', [
        'flightlog'
      ]),
      spanCls() {
        return this.flightlog.open ? 'text-success' : 'text-danger';
      },
      iCls() {
        return this.flightlog.open ? 'fa fa-file-text' : 'fa fa-check-circle';
      },
      statusText() {
        return this.flightlog.open ? 'Open' : 'Completed';
      },
      oldAppLink() {
        let link = '';
        const {flightlog} = this;
        const {manifest} =  flightlog;

        switch(this.$route.name) {
          case 'pilot_log_edit':
            link = `/flightlog/manifest/${manifest.id}/flight_logs/${flightlog.id}/edit`;
            break;
          case 'pilot_log_view':
            link = `/flightlog/manifest/${manifest.id}/flight_logs/${flightlog.id}/view`;
            break;
          case 'dispatch_log_edit':
            link = `/dispatch/manifest/${manifest.id}/flight_logs/${flightlog.id}/edit`;
            break;
          case 'dispatch_log_view':
            link = `/dispatch/manifest/${manifest.id}/flight_logs/${flightlog.id}/view`;
            break;
        }

        return link;
      }
    }
  };
</script>

<template>
  <div class="ibox float-e-margins log-status-block">
    <div class="ibox-content p-md text-center">
      <p>Flight Log Status:
        <span :class="spanCls">{{statusText}} <i :class="iCls"></i></span>
      </p>
      <h1>Flight Manifest #{{flightlog.manifest.number}}</h1>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .log-status-block {
    position: relative;
    &__classic-link {
      position: absolute;
      right: 20px;
      display: inline-block;
      @media screen and (max-width: $screen-xs-max) {
        margin-bottom: 15px;
        position: static;
      }
    }
  }
</style>
