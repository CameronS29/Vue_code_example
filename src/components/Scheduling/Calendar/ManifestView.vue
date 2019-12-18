<script>
  import { mapMutations, mapState } from 'vuex';
  import { SET_SHOW_MANIFEST_ID } from 'store/modules/scheduling/consts';
  import BottomPopper from 'Common/BottomPopper.vue';

  export default {
    components: {
      BottomPopper,
    },
    computed: {
      ...mapState('scheduling/calendar', ['showManifestId']),
      reportLink() {
        return `/flightlog/pdf-report/${this.showManifestId}/`;
      },
    },
    methods: {
      ...mapMutations('scheduling/calendar', [SET_SHOW_MANIFEST_ID]),
      handleCloseClick() {
        this[SET_SHOW_MANIFEST_ID](null);
      },
    },
  };
</script>

<template>
  <bottom-popper
    class="embed-manifest"
    :show="!!showManifestId"
    @close="handleCloseClick"
    header-height="54px"
  >
    <header slot="header">
      <div class="embed-manifest__header">
        <span class="embed-manifest__title">Manifest #{{ showManifestId }}</span>

        <router-link :to="{ name: 'pilot_manifest_view', params: { id: showManifestId } }">
          <el-button
            size="medium"
            round>View Manifest
          </el-button>
        </router-link>
      </div>

    </header>

    <object
      class="manifest-confirm-modal__pdf-report-object"
      :data="`${reportLink}#toolbar=0&navpanes=0&view=Fit&zoom=100`"
      type="application/pdf"
      width="100%"
      height="900px"
    >
      <p>It appears you don't have a PDF plugin for this browser.
        <br> No biggie... you can
        <a :href="reportLink">click here to download the PDF file.</a>
      </p>
    </object>
  </bottom-popper>
</template>


<style lang="scss">
  .embed-manifest {
    &__header {
      display: flex;
      align-items: center;
      height: 36px;
    }
    &__title {
      margin-right: 15px;
    }
    &__pdf-wrapper {
      height: 900px;
    }
  }
</style>
