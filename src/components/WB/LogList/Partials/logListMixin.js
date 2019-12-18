import { mapGetters, mapActions } from 'vuex';
import { TableColumn } from 'element-ui';

import GenericList from './Generic.vue';


export default {
  components: {
    GenericList,
    TableColumn,
  },

  computed: mapGetters('user', [
    'isAdmin',
  ]),

  methods: {
    ...mapActions('wb', ['deleteLog']),

    handleDeleteLog({ id }) {
      this.$confirm('This will permanently delete this log. Continue?', 'Confirm Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonClass: 'el-button--danger',
        type: 'error',
      }).then(() => this.deleteLog(id));
    },
  },
};
