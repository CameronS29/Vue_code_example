<script>
  import { mapMutations } from 'vuex';
  import { SET_SHOW_MANIFEST_ID } from 'store/modules/scheduling/consts';

  import BaseRecord from './BaseRecord';

  const TYPE_SCHEDULED = 'Scheduled';
  const TYPE_UNSCHEDULED = 'Charter';
  const TYPE_REPOSITION = 'Reposition';
  const TYPE_MAINTENANCE = 'Maintenance';
  const TYPE_TRAINING = 'Training';

  export default {
    name: 'DayManifest',

    components: { BaseRecord },

    props: {
      manifest: Object,
    },

    computed: {
      classes() {
        const { type } = this.manifest;
        return {
          'calendar-block__manifest': true,
          'calendar-block__manifest_scheduled': type === TYPE_SCHEDULED,
          'calendar-block__manifest_unscheduled': type === TYPE_UNSCHEDULED,
          'calendar-block__manifest_reposition': type === TYPE_REPOSITION,
          'calendar-block__manifest_maintenance': type === TYPE_MAINTENANCE,
          'calendar-block__manifest_training': type === TYPE_TRAINING,
        };
      },

      title() {
        const { duty_on, duty_off, type } = this.manifest;
        return `${type}, ${duty_on.slice(11, 16)} - ${duty_off.slice(11, 16)}`;
      },
    },
    methods: {
      ...mapMutations('scheduling/calendar', [SET_SHOW_MANIFEST_ID]),
      handleClick(e) {
        e.stopPropagation();

        this.SET_SHOW_MANIFEST_ID(this.manifest.id);
      },
    },
  };
</script>

<template>
  <base-record :class="classes" :title="title" @click="handleClick">
    {{ manifest.number }}
  </base-record>
</template>

<style lang="scss">
  @import '../../../../../../scss/bs-variables';
  @import '../../../../../../scss/variables';

  .calendar-block {
    &__manifest {
      background: lighten($brand-primary, 5%);
      color: lighten($light-gray, 5%);

      &_unscheduled {
        background: lighten($brand-primary, 15%);
      }

      &_reposition {
        background: lighten($brand-info, 5%);
        color: #fff;
      }

      &_maintenance {
        background: lighten($brand-warning, 5%);
        color: #fff;
      }

      &_training {
        background: lighten($brand-success, 5%);
        color: #fff;
      }
    }
  }
</style>
