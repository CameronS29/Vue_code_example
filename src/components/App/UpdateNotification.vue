<script>
  import { mapGetters } from 'vuex';
  import { Notification } from 'element-ui';

  export default {
    name: 'UpdateNotification',
    computed: mapGetters('app/update', ['hasChanged', 'isDown']),

    data() {
      return {
        downNotification: undefined,
        updateNotification: undefined,
      };
    },

    methods: {
      showUpdateNotification() {
        if (this.updateNotification !== undefined) {
          this.updateNotification.close();
          this.updateNotification = undefined;
        }

        if (this.hasChanged) {
          this.updateNotification = Notification.success({
            title: 'New Release',
            message: ('Application has been updated! ' +
              'Please save all changes and refresh the page ' +
              'to use latest features.'),
            duration: 7000,
          });
        }
      },

      showShutdownNotification() {
        if (this.downNotification !== undefined) {
          this.downNotification.close();
          this.downNotification = undefined;
        }

        if (this.isDown) {
          this.downNotification = Notification.warning({
            title: 'FLTOPS is shutting down',
            message: ('We\'re installing an update, and during this process ' +
              'the portal won\'t be available. ' +
              'Don\'t worry, this won\'t take long.'),
            duration: 0,
          });
        }
      },
    },

    watch: {
      isDown: 'showShutdownNotification',
      hasChanged: 'showUpdateNotification',
    },
  };
</script>

<template>
  <div />
</template>
