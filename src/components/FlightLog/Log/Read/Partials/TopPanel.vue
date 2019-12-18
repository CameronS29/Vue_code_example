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
      }
    }
  };
</script>

<template>
  <div class="row wrapper border-bottom white-bg page-heading">
    <h2>Flight Log View</h2>
    <ol class="breadcrumb">
      <li>
        <router-link
          :to="{ name: 'dashboard'}"
          title="Dashboard">
          Dashboard
        </router-link>
        /
        <router-link
          :to="{ name: 'manifest', params: {id: flightlog.manifest.id}}"
          title="Manifest">
          #{{flightlog.manifest.number}}
        </router-link>
      </li>
    </ol>
  </div>
</template>
