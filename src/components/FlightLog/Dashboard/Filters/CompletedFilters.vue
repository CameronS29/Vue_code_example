<script>
  import pickBy from 'lodash/pickBy';
  import debounce from 'lodash/debounce';
  import {mapGetters, mapActions} from 'vuex';

  import ButtonEl from 'element-ui/lib/button';
  import Selectize from '../../../fields/Selectize.vue';

  import {queryParam} from '../../../../utils/routers';
  import optionsApi from '../../../../api/options';

  export default {
    props: {
      filters: {
        type: Object,
        required: true,
      },
    },

    model: {
      prop: 'filters',
      event: 'filter',
    },

    components: {
      Selectize,
      ButtonEl,
    },

    data() {
      return {
        operations: [],
      };
    },

    created() {
      this.updateFilters = debounce(this.updateFilters, 300);
      this.getAllOptions();
      this.updateFilters();
    },

    computed: {
      ...mapGetters('wb', [
        'availableAircrafts',
      ]),

      tailNumber: queryParam({
        param: 'c_tail_number',
        defaultValue: 0,
        mapper: Number,
      }),
    },

    methods: {
      ...mapActions('wb', [
        'getAllOptions',
      ]),

      updateFilters() {
        this.$emit('filter', pickBy({
          aircraft: this.tailNumber,
        }));
      },

      clearFilters() {
        this.tailNumber = '';
      },
    },

    watch: {
      tailNumber: 'updateFilters',
    },
  };
</script>

<template>
  <div>
    <div class="dispatch-dashboard__manifests-list__filters">
      <selectize
        class="manifests-list__filter-item"
        v-model="tailNumber"
        :items="availableAircrafts"
        field="registration"
        label="Tail Number"
        full-label="Select Aircraft"
      />
    </div>
    <hr/>
  </div>
</template>
