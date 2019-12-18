<script>
  import { mapMutations } from 'vuex';
  import Modal from 'Common/Modal.vue';
  import ViewPortal from 'Common/ViewPortal.vue';
  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';
  import { SET_SANDBOX } from 'store/modules/fdt/calendar';

  import FilterForm from './FilterForm/GeneralFilters.vue';
  import Calendar from './Calendar.vue';

  import permissionMixin from '../Common/permissionMixin';
  import viewMixin from '../Common/viewMixin';
  import Totals from './Partials/Totals.vue';
  import ManagePopup from './Manage/Calendar/Popup.vue';

  export default {
    mixins: [
      permissionMixin,
      viewMixin,
    ],

    created() {
      this[SET_SANDBOX]();
    },

    methods: mapMutations('fdt/calendar', [SET_SANDBOX]),

    components: {
      ManagePopup,
      FilterForm,
      Modal,
      HorizontalScrollable,

      Calendar,
      Totals,
      ViewPortal,
    },
  };
</script>

<template>
  <main class="fdt-calendar">
    <view-portal min-width="1300px" to="header">
      <filter-form />
    </view-portal>

    <totals show-approve />

    <horizontal-scrollable>
      <calendar :ocf-edit="!isOnPublishedRevision && !onlyDispatch"
                :pilot-id="pilot.id"
                :month="month"
                :year="year" />
    </horizontal-scrollable>

    <manage-popup v-if="pilot.id" :pilot="pilot.id" />
  </main>
</template>
