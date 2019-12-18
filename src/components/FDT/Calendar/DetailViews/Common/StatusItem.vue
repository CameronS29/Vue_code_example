<script>
  const STATUS_VALUES = new Set(['green', 'red', 'yellow', 'black']);

  export default {
    props: {
      title: [String, Number],
      caption: String,
      status: {
        type: String,
        default: 'green',
        validator(value) {
          return STATUS_VALUES.has(value);
        },
      },
    },

    computed: {
      statusClass() {
        return [`status-item__status_${this.status}`];
      },
    },
  };
</script>

<template>
  <div class="status-item">
    <div class="status-item__status" :class="statusClass"></div>
    <span class="status-item__title">{{ title }}</span>
    <span class="status-item__caption">{{ caption }}</span>
  </div>
</template>

<style>
  .status-item {
    margin: 10px 0;
    padding-left: 27px;
  }

  .status-item::after {
    display: block;
    content: '';
    clear: both;
  }

  .status-item__status {
    height: 20px;
    width: 20px;
    margin-left: -27px;
    border-radius: 50%;
    float: left;
  }

  .status-item__status_green {
    background-color: #1ab394;
  }

  .status-item__status_red {
    background-color: #ed5565;
  }

  .status-item__status_yellow {
    background-color: #f8ac59;
  }

  .status-item__status_black {
    background-color: #292929;
  }

  .status-item__title {
    font-weight: bold;
    margin-right: 3px;
  }
</style>
