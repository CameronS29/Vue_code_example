<script>
  import Card from 'Common/Card.vue';

  export default {
    name: 'DutyList',
    props: {
      data: { type: Array, default: () => ([]) },
      title: { type: String, required: true },
      editable: { type: Boolean, default: false },
    },

    components: { Card },
  };
</script>

<template>
  <card class="fdt-duty-list__duty-type-list">
    <div class="card__title" slot="title">
      {{ title }}
      <el-button class="fdt-duty-list__add-duty"
                 v-if="editable"
                 @click="$emit('add')"
                 size="mini"
                 icon="el-icon-plus"
                 round />
    </div>

    <slot>
      <div v-for="duty in data" :key="duty.id" class="fdt-duty-list__duty-list-item">
        <slot name="item" v-bind="duty" />
      </div>

      <div v-if="data.length === 0" class="fdt-duty-list__empty-title">
        There's no actual data.
      </div>
    </slot>
  </card>
</template>

<style lang="scss">
  .fdt-duty-list {
    &__duty-type-list.card_light {
      flex: 1 1 (100% / 3);
      color: #444;
      border-radius: 0;

      & + & {
        border-left: 1px solid #eee;
      }

      .card__container {
        display: flex;
        flex-flow: column;
      }
    }

    &__duty-list-item {
      padding: 4px 5px;
      display: flex;
      align-items: center;

      & + & { border-top: 1px solid #eee; }
    }
  }
</style>
