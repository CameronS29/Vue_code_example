<script>

  import Promise from 'bluebird';
  import { mapActions, mapGetters } from 'vuex';
  import ManifestRead from '../../FlightLog/ManifestView/Read/View.vue';
  import ManifestLoading from '../../WB/LogView/LogLoading.vue';
  import ManifestNotFound from '../../FlightLog/ManifestView/NotFound/View.vue';

  export default {
    props: ['id'],
    components: {
      ManifestRead,
      ManifestLoading,
      ManifestNotFound
    },

    created() {
      this.getManifestData();
    },

    watch: {
      id() {
        this.getManifestData()
      }
    },

    methods: {
      ...mapActions('manifest', [
        'getManifest',
      ]),

      getManifestData() {
        this.notFound = false;
        Promise.join(
          this.getManifest(this.id),
        ).catch(() => { this.notFound = true; });
      },
    },

    computed: {
      ...mapGetters('manifest', [
        'selectedAircraftType',
        'manifest',
      ]),
      manifestComponent() {
        if (this.notFound) {
          return 'ManifestNotFound';
        }

        if (this.manifest.id) {
          return 'ManifestRead';
        }

        return 'ManifestLoading';
      },
    }
  }
</script>

<template>
  <div class="wrapper wrapper-content animated fadeInRight">
    <component
      :is="manifestComponent"
      :id="Number(id)"
      :hideButtons="true"
      :backUrl="{ name: 'fsdo_dashboard' }"
    />
  </div>
</template>
