<script>
  import dtFieldMixin from './dtFieldMixin';
  export default {
    mixins: [dtFieldMixin],
  };
</script>

<template>
  <collapse title="Duty ON Time" :gutterColor="false" class="edit-manifest-duty-on-time">
    <duty-time-field field="duty_on"
      :duty="picDuty"
      @update:manifest="updateDtField"
      class="edit-manifest-duty-on-time__group"
      profile-field="pic_profile" label-full="PIC ON (LOCAL BASE TIME)"
      profile-label="PIC" label-short="ON" />
    <duty-time-field field="duty_on"
      :duty="sicDuty"
      base-field="sic_base"
      @update:manifest="updateDtField"
      class="edit-manifest-duty-on-time__group"
      profile-field="sic_profile" label-full="SIC ON (LOCAL BASE TIME)"
      profile-label="SIC" label-short="ON" />
    <p>LOCAL BASE TIME: Use the local time of your base. Regardless of what station
    you fly out of the local time is always based off your home base.</p>
  </collapse>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .edit-manifest-duty-on-time {
    &__group-split {
      @media screen and (max-width: $screen-xs-max) {
        flex-flow: row wrap;
      }
    }
  }
</style>
