<script>
  import { mapGetters, mapActions } from 'vuex';

  import GenericTable from '../../../Common/Passengers/GenericTable.vue';
  import ExtraBags from './ExtraBags.vue';
  import Person from './Person.vue';


  export default {
    props: {
      id: [String, Number],
    },

    components: {
      GenericTable,
      Person,
      ExtraBags,
    },

    computed: {
      ...mapGetters('wb/passenger', ['sortedPassengers']),
      ...mapGetters('wb', [
        'showLockFields',
        'log',
      ]),

      maxColSpan() {
        return 6 + (this.showLockFields ? 2 : 0);
      },
    },
  };
</script>

<template>
  <div class="panel panel-body col-sm-12">
    <div class="wb-passenger-table__header">
      <h2>Passengers</h2>
      <slot name="header"></slot>
    </div>
    <hr>

    <generic-table :wbid="id">
      <tbody class="passenger-table__body">
      <person
        v-for="(item, idx) in sortedPassengers"
        :key="item && item.id || `new-${idx}`"
        :passenger="item"
      ></person>
      </tbody>

      <extra-bags
        class="passenger-table__body"
        :colSpan="maxColSpan"
        :weight="log.extra_bag"
        :count="log.extra_bag_count"
      ></extra-bags>
    </generic-table>
  </div>
</template>
