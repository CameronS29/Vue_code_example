<script>
  import some from 'lodash/some';
  import { mapActions } from 'vuex';
  import { passengerFilled } from './helpers';
  import Icon from '../../../../../Common/Icon.vue';

  export default {
    props: {
      log: Object,
      passengers: Array,
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    components: {
      Icon,
    },

    computed: {
      hasData() {
        return some(this.passengers, passengerFilled);
      },

      isDisabled() {
        return !(this.log.id && this.log.flight) || this.disabled;
      },
    },

    methods: {
      ...mapActions('wb/passenger', [
        'fetchVidecomPassengers',
      ]),

      pullPassengersFromVidecom() {
        return this.fetchVidecomPassengers(this.log.id)
          .then(() => this.$notify({
            type: 'success',
            message: 'Passengers successfully pulled from Videcom',
          }))
          .catch(({ response: { data: { message } } }) => (this.$notify({
            type: 'error',
            title: 'Videcom Response',
            message: `Error occurred while fetching passengers: ${message}`,
          })));
      },

      handleClick() {
        if (this.hasData) {
          this.$confirm(
            'There are existing passengers listed on this WB log, ' +
            'are you sure you want to pull the list from Videcom ' +
            'and override the existing passenger list?',
            {
              confirmButtonText: 'Yes',
            },
          ).then(this.pullPassengersFromVidecom);
        } else {
          this.pullPassengersFromVidecom();
        }
      },
    },
  };
</script>

<template>
  <el-button @click="handleClick"
             :disabled="isDisabled"
             class="videcom-button"
             type="primary"
             size="small"
             plain
             icon="fa fa-cloud-download fa-fw">
    <span class="videcom-button__caption">Pull Passengers from Videcom</span>
  </el-button>
</template>

<style lang="scss" scoped>
  @import "../../../../../../../scss/bs-variables";

  .videcom-button {
    margin-bottom: -4px;

    @media screen and (max-width: $screen-xs-max) {
      &__caption {
        display: none;
      }
    }
  }
</style>
