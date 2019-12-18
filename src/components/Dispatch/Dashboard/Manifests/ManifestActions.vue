<script>
  import { mapActions, mapGetters } from 'vuex';
  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED,
  } from '../../../../store/modules/flightlog/consts';

  export default {
    props: {
      manifest: {
        type: Object,
        required: true,
      },
      canDelete: {
        type: Boolean,
        required: false,
      },
    },

    computed: {
      ...mapGetters('user', [
        'isAdmin',
        'isDispatcher',
        'isPilot',
      ]),
      pilotPage() {
        return this.$route.name.indexOf('pilot_') > -1;
      },
      editable() {
        const { status } = this.manifest;
        if (this.pilotPage) {
          return status == STATUS_OPEN || status == STATUS_PENDING_PIC;
        } else {
          return status !== 3 && status !== 5;
        }
      },

      confirmable() {
        return this.manifest.status === 3 && this.$route.name === "dispatch_dashboard";
      },

      manifestViewPathName() {
        console.log(this.$router);
        return this.$route.name.indexOf('pilot_') > -1 ? 'pilot_manifest_view' : 'dispatch_manifest_view';
      },
      manifestEditPathName() {
        return this.$route.name.indexOf('pilot_') > -1 ? 'pilot_manifest_edit' : 'dispatch_manifest_edit';
      },
    },

    methods: {
      ...mapActions('dispatch/confirm', {
        setConfirm: 'setManifest',
      }),

      ...mapActions('dispatch/delete', {
        setDelete: 'setManifest',
      }),
    },
  };
</script>

<template>
  <span>
    <router-link
      class="btn btn-success btn-xs"
      v-if="editable"
      :to="{ name: manifestEditPathName, params: {id: manifest.id}}"
      title="Edit Manifest">
      <i class="fa fa-edit"></i>
    </router-link>

    <a class="btn btn-primary btn-xs" v-else-if="confirmable" title="Confirm manifest" @click.prevent="setConfirm(manifest)">
      <i class="fa fa-check"></i>
    </a>

    <router-link
      class="btn btn-default btn-xs" title="View manifest"
      :to="{ name: manifestViewPathName, params: {id: manifest.id}}"
      v-if="!editable"
    >
      <i class="fa fa-eye"></i>
    </router-link>

    <a target="_blank" class="btn btn-default btn-xs" title="View PDF report"
       :href="`/flightlog/pdf-report/${manifest.id}/`">
      <i class="fa fa-file-pdf-o"></i>
    </a>

    <a v-if="canDelete" class="btn btn-danger btn-xs" title="Delete manifest"
       @click.prevent="setDelete(manifest)">
      <i class="fa fa-trash-o"></i>
    </a>
  </span>
</template>
