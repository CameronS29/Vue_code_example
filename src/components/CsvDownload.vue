<script>
  import { mapState } from 'vuex';

  import { downloadURI } from '../utils/helpers';
  import { TABLE_NAMESPACE } from 'store/modules/dispatch/flight-list';

  export default {
    computed: {
      ...mapState(TABLE_NAMESPACE, ['CSVpending', 'CSVpath']),
    },
    data() {
      return { flightListPendingMessage: {}, };
    },
    watch: {
      CSVpath(filePath) {
        if (filePath) {
          downloadURI(filePath);
        }
      },
      CSVpending(value, oldValue) {
        if (value > oldValue) {
          this.flightListPendingMessage[value] = this.$message({
            showClose: true,
            message: 'CSV Generating...',
            duration: 0,
            type: 'success',
          });
        } else {
          if (this.flightListPendingMessage[oldValue]) {
            this.flightListPendingMessage[oldValue].close();
            delete this.flightListPendingMessage[oldValue];
          }
        }
      },
    },
  };
</script>

<template></template>
