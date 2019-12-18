<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

  export default {
    props: {
      flight: {
        type: Object,
        required: true,
      },
      addBtn: {
        type: Boolean,
        default: false,
      },
      removeBtn: {
        type: Boolean,
        default: false,
      },
    },
    components: {},
    computed: {
      ...mapState('routeplanningGantt/lines', [
        'lines',
      ]),
    },
    methods: {
      ...mapActions('routeplanningGantt/lines', [
        'getLines',
      ]),
      handleAddClick() {
        this.$emit('add-click', this.flight);
      },
      handleRemoveClick() {
        this.$emit('remove-click', this.flight);
      },
    },
  };
</script>

<template>
  <div class="lines-flight">
    <div class="lines-flight__row">
      <i v-if="addBtn" @click="handleAddClick" class="fa fa-plus-square lines-flight__add" />
      <i v-if="removeBtn" @click="handleRemoveClick" class="fa fa-trash lines-flight__remove" />

      <span class="lines-flight__number">{{ flight.flight_number }}</span>
    </div>
    <div class="lines-flight__row">
      <span class="lines-flight__airport">{{ flight.origin }}</span>
      <span class="lines-flight__airport">{{ flight.destination }}</span>
    </div>
    <div class="lines-flight__row">
      <span class="lines-flight__time">{{ flight.scheduled_departure | timeSimpleUTC }}</span>
      <span class="lines-flight__time">{{ flight.scheduled_arrival | timeSimpleUTC }}</span>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .lines-flight {
    flex: 0 0;
    padding: 6px;
    &__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &__add {
      color: $brand-success;
      cursor: pointer;
      margin-right: 5px;
    }
    &__remove {
      color: $red;
      cursor: pointer;
      margin-right: 5px;
    }

    &__number {
      font-size: 22px;
      font-weight: bold;
      line-height: 1.09;
      letter-spacing: -0.2px;
      white-space: nowrap;
    }
    &__airport {
      font-size: 18px;
      line-height: 18px;
      &:first-child {
        margin-right: 5px;
      }
    }
    &__time {
      font-size: 14px;
      &:first-child {
        margin-right: 5px;
      }
    }

  }
</style>
