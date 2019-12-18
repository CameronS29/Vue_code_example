<script>
  import { mapGetters } from 'vuex';

  import Card from 'Common/Card.vue';
  import Person from '../../Read/Partials/Passengers/Person.vue';
  import ExtraBags from '../../Read/Partials/Passengers/ExtraBags.vue';
  import GenericTable from '../../Common/Passengers/GenericTable.vue';

  export default {
    name: 'Passengers',

    props: {
      id: [Number, String],
    },

    components: {
      Card,
      GenericTable,
      Person,
      ExtraBags,
    },

    computed: {
      ...mapGetters('wb/passenger', ['sortedPassengers']),
      ...mapGetters('wb', ['log']),
    },
  };
</script>

<template>
  <card title="Passengers" class="wb-confirm-modal__passengers">
    <generic-table :wbid="id">
      <tbody class="passenger-table__body">
      <person
        v-for="(item, idx) in sortedPassengers"
        :key="item && item.id || `new-${idx}`"
        :passenger="item"
      />
      </tbody>

      <extra-bags
        class="passenger-table__body"
        :colSpan="6"
        :weight="log.extra_bag"
        :count="log.extra_bag_count"
      />
    </generic-table>
  </card>
</template>

<style lang="scss">
  .wb-confirm-modal__passengers {
    .card__heading {
      padding-bottom: 5px;
    }

    .passenger-table {
      &__cell, &__field {
        padding: 4px 3px;
      }

      &__field, &__field_readonly {
        .field__badge {
          margin: 0 10px 0 0;
        }
      }
    }
  }
</style>
