<script>
  import dtFieldMixin from './dtFieldMixin';
  export default {
    mixins: [dtFieldMixin],
  };
</script>

<template>
  <collapse title="Duty OFF Time" :gutterColor="false" class="edit-manifest-duty-off-time">
    <duty-time-field field="duty_off"
      :duty="picDuty"
      @update:manifest="updateDtField"
      class="edit-manifest-duty-off-time__group"
      profile-field="pic_profile" label-full="PIC OFF (LOCAL BASE TIME)"
      profile-label="PIC" label-short="OFF" />
    <duty-time-field field="duty_off"
      :duty="sicDuty"
      @update:manifest="updateDtField"
      class="edit-manifest-duty-off-time__group"
      profile-field="sic_profile" label-full="SIC OFF (LOCAL BASE TIME)"
      profile-label="SIC" label-short="OFF" />
    <p>LOCAL BASE TIME: Use the local time of your base. Regardless of what station
    you fly out of the local time is always based off your home base.</p>
  </collapse>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .edit-manifest-duty-off-time {
    &__group-split {
      @media screen and (max-width: $screen-xs-max) {
        flex-flow: row wrap;
      }
    }
  }
</style>

