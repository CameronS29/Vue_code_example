<script>
  import { mapGetters } from 'vuex';
  import QuantityField from './QuantityField.vue';

  export default {
    props: {
      passenger: Object,
    },

    components: {
      QuantityField,
    },

    computed: mapGetters('wb', ['showLockFields']),
  };
</script>

<template>
  <tr class="passenger-table__row passenger-table__person">
    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_badge">
      <span class="field__badge field__badge_desktop field_nowrap field_non-interactive">
        <b>S# {{ passenger.seat_number }}</b>
        <i class="fa fa-user-o" aria-hidden="true"></i>
      </span>
      <div class="field__badge field__badge_mobile field_nowrap field_non-interactive">
        <div class="field__badge_rotate">
          <div class="field__badge_rotate_inner">
            <i aria-hidden="true" class="fa fa-ellipsis-v"></i>
            Seat #{{ passenger.seat_number }}
          </div>
        </div>
      </div>
    </td>

    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_full">
      <label>Full name</label>
      {{ passenger.full_name || '&ndash;' }}
    </td>

    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_half">
      <label>Weight</label>
      {{ passenger.weight || '&ndash;' }}
    </td>

    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_half">
      <label>Lap bag</label>
      {{ passenger.lap_bag || '&ndash;' }}
    </td>

    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_half">
      <label>Gate bag</label>
      <quantity-field
        :value="passenger.gate_bag"
        :count="passenger.gate_bag_count"
      ></quantity-field>
    </td>

    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_half">
      <label>TSA bag</label>
      <quantity-field
        :value="passenger.tsa_bag"
        :count="passenger.tsa_bag_count"
      ></quantity-field>
    </td>

    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_half" v-if="showLockFields">
      <label>Gate bag wing locker</label>
      <quantity-field
        :value="passenger.gate_bag_wing_locker"
        :count="passenger.gate_bag_wing_locker_count"
      ></quantity-field>
    </td>

    <td class="passenger-table__field passenger-table__field_readonly passenger-table__field_half" v-if="showLockFields">
      <label>TSA bag wing locker</label>
      <quantity-field
        :value="passenger.tsa_bag_wing_locker"
        :count="passenger.tsa_bag_wing_locker_count"
      ></quantity-field>
    </td>
  </tr>
</template>

<style lang="scss" src="../../../../scss/person.scss"> </style>

