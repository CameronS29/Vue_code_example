<script>
  import { mapMutations } from 'vuex';
  import ViewPortal from 'Common/ViewPortal.vue';
  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';
  import { SET_SANDBOX } from 'store/modules/fdt/calendar';

  import SandboxFilters from './FilterForm/SandboxFilters.vue';
  import Calendar from './Calendar.vue';

  import Totals from './Partials/Totals.vue';
  import ManagePopup from './Manage/Sandbox/Popup.vue';
  import viewMixin from '../Common/viewMixin';

  export default {
    name: 'SandboxView',
    mixins: [viewMixin],

    created() {
      this[SET_SANDBOX](true);
    },

    destroyed() {
      this[SET_SANDBOX]();
    },

    methods: mapMutations('fdt/calendar', [SET_SANDBOX]),

    components: {
      SandboxFilters,
      HorizontalScrollable,
      ManagePopup,

      Calendar,
      Totals,
      ViewPortal,
    },
  };
</script>

<template>
  <main class="fdt-sandbox">
    <view-portal min-width="1300px" to="header">
      <sandbox-filters />
    </view-portal>

    <totals />

    <horizontal-scrollable>
      <calendar :pilot-id="pilot.id" :month="month" :year="year" />
    </horizontal-scrollable>

    <manage-popup v-if="pilot.id" :pilot="pilot.id" />
  </main>
</template>
