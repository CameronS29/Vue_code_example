<script>
    export default {
      props: {
        title: String,
        message: String,
        type: {
          type: String,
          default: 'info',
          validator(value) {
            return ['info', 'success', 'warning', 'danger']
              .indexOf(value) >= 0;
          },
        },
      },
    };
</script>

<template>
    <div :class="['Alert', `Alert_${type}`]">
      <slot>
        <strong v-if="title">{{ title }}:</strong>
        <span>{{ message }}</span>
      </slot>
    </div>
</template>

<style>
  .Alert {
    padding: .75em 1em;
    margin-bottom: 1em;
    border: 1px solid transparent;
    border-radius: 0.3em;
  }

  .Alert_info {
    background-color: rgba(0, 144, 224, 0.1);
    border-color: rgba(0, 144, 224, 0.05);
    color: #0090e0;
  }

  .Alert_success {
    background-color: rgba(52, 194, 64, 0.1);
    border-color: rgba(52, 194, 64, 0.05);
    color: #34c240;
  }

  .Alert_warning {
    background-color: rgba(250, 159, 71, 0.1);
    border-color: rgba(250, 159, 71, 0.05);
    color: #fa9f47;
  }

  .Alert_danger {
    background-color: rgba(214, 66, 66, 0.1);
    border-color: rgba(214, 66, 66, 0.05);
    color: #d64242;
  }
</style>
