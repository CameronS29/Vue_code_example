<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { some } from 'lodash';
  import Draggable from 'vuedraggable';
  import Card from 'Common/Card.vue';

  import {
    ORDER_ASC,
    ORDER_DESC,
    RECEIVE_PASSENGERS,
  } from 'store/modules/wb/consts';

  import updateLogMixin, { logProperty, toNumber } from '../updateLogMixin';
  import { passengerFilled } from './helpers';

  import GenericTable from '../../../Common/Passengers/GenericTable.vue';
  import ActionButton from '../../../Common/Passengers/ActionButton.vue';

  import ExtraBag from './ExtraBags.vue';
  import Person from './Person.vue';
  import VidecomBtn from './VidecomBtn.vue';


  export default {
    mixins: [updateLogMixin],

    props: {
      id: [String, Number],
    },

    components: {
      GenericTable,
      ActionButton,
      Draggable,
      Person,
      ExtraBag,
      VidecomBtn,
      Card,
    },

    computed: {
      ...mapGetters('wb/passenger', ['sortedPassengers']),
      ...mapGetters('wb', ['showLockFields', 'isLoading']),

      passengerList: {
        get() {
          return this.sortedPassengers;
        },
        set(value) {
          this[RECEIVE_PASSENGERS](value);
          this.remapSeats();
        },
      },

      dragEnabled() {
        return !this.disabled && some(this.sortedPassengers, passengerFilled);
      },

      maxColSpan() {
        return 6 + (this.showLockFields ? 2 : 0);
      },

      extraBag: logProperty('extra_bag', toNumber),
      extraBagCount: logProperty('extra_bag_count', toNumber),
    },

    methods: {
      ...mapMutations('wb/passenger', [
        RECEIVE_PASSENGERS,
        ORDER_DESC,
        ORDER_ASC,
      ]),
      ...mapActions('wb/passenger', [
        'remapSeats',
      ]),

      orderDESC() {
        this[ORDER_DESC]();
        this.remapSeats();
      },

      orderASC() {
        this[ORDER_ASC]();
        this.remapSeats();
      },
    },
  };
</script>

<template>
  <card>
    <div slot="title" class="wb-passenger-table__header">
      <div class="card__title">Passengers</div>
      <videcom-btn
        :log="log"
        :passengers="sortedPassengers"
        :disabled="disabled || isLoading"
      />
    </div>

    <generic-table :wbid="id">
      <draggable
        v-model="passengerList"
        class="passenger-table__body"
        element="tbody"
        :options="{handle: '.handle', ghostClass: 'ghost'}"
        @start="drag=true"
        @end="drag=false"
      >
        <person
          v-for="(item, idx) in passengerList"
          :key="item && item.id || `new-${idx}`"
          :drag-enabled="dragEnabled"
          :passenger="item"
          @update="$emit('update')"
          :disabled="disabled"
        />
      </draggable>

      <extra-bag
        class="passenger-table__body"
        :col-span="maxColSpan"
        :weight.sync="extraBag"
        :count.sync="extraBagCount"
        :disabled="disabled"
      />

      <td class="passenger-table__cell passenger-calculations__sort" slot="action-buttons">
        <action-button
          class="passenger-calculations__sort-button"
          icon="sort-amount-desc"
          title="Heavy to Light Sort Passengers"
          @click="orderDESC"
          :disabled="disabled"
        />
        <action-button
          class="passenger-calculations__sort-button"
          icon="exclamation-triangle"
          title="Worst Case Scenario Sort Passengers"
          @click="orderASC"
          :disabled="disabled"
        />
      </td>
    </generic-table>
  </card>
</template>

