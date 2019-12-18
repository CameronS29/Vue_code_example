import { mapActions, mapGetters } from 'vuex';
import {queryGetter} from '../../../../utils/routers';

const createListMixin = (module, extraFilters = {}) => ({
  props: {
    type: [String, Number],
  },

  computed: {
    ...mapGetters(`manifest/${module}`, [
      'logList',
      'page',
      'pageSize',
      'count',
      'isLoaded',
    ]),

    search: queryGetter('search'),
  },

  created() {
    this.getSearchLogs();
  },

  methods: {
    ...mapActions(`manifest/${module}`, [
      'getLogs',
      'setPage',
      'setPageSize',
      'reset',
    ]),

    ...mapActions('manifest', [
      'setDelete',
    ]),

    getSearchLogs() {
      const { search, type: aircraftType } = this;
      this.getLogs({
        filters: { ...extraFilters, search },
      });
    },
  },

  watch: {
    type() {
      this.reset();
      this.getSearchLogs();
    },

    search() {
      this.setPage(1);
      this.getSearchLogs();
    },

    page: 'getSearchLogs',
    pageSize: 'getSearchLogs',
  },
});

export default createListMixin;
