<script>

  import {DateTime} from "luxon";

  const NAMES = {
    0: "comment",
    1: "pilot",
    2: "dispatch",
    3: "reopen",
    4: "pin_reopen",
    5: "for_pic",
    6: "out",
    7: "in",
  };

  export default {
    props: {
      logs: Array
    },
    methods: {
      logType(log) {
        return NAMES[log.log_type];
      },
      iconClass(log) {
        const type = this.logType(log);
        return {
          "fa-check-circle": type === "pilot" || type === "dispatch" || type === 'for_pic' || type === 'out' || type === 'in',
          "fa-comment": type === "comment",
          "fa-undo": type === "reopen" || type === 'pin_reopen',
        }
      }
    },
  };
</script>

<template>
  <div>
    <div v-for="statusLog in logs" class="status-row">
      <div class="status-log">
      <span class="status-log__icon">
        <i class="fa" :class="iconClass(statusLog)" aria-hidden="true"></i>
      </span>
        <span class="status-log__date">{{ statusLog.datetime|shortDT }}</span>
        <div class="status-log__body">
          <div>
          <span class="status-log__name">
            {{ statusLog.user.first_name }} {{ statusLog.user.last_name }}
          </span>
            <span v-if="logType(statusLog) == 'comment'"> commented</span>
            <span v-else-if="logType(statusLog) == 'pilot'"> pined as PIC</span>
            <span v-else-if="logType(statusLog) == 'dispatch'"> completed as Dispatcher</span>
            <span v-else-if="logType(statusLog) == 'reopen'"> re-opened as Dispatcher</span>
            <span v-else-if="logType(statusLog) == 'pin_reopen'"> sent back for PIC PIN </span>
            <span v-else-if="logType(statusLog) == 'for_pic'"> sent for PIC PIN </span>
            <span v-else-if="logType(statusLog) == 'out'"> reviewed OUT date/time </span>
            <span v-else-if="logType(statusLog) == 'in'"> reviewed IN date/time </span>
          </div>
          <div class="status-log__action_label bubble" v-if="statusLog.text">
            {{ statusLog.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .status-log {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    > span {
      margin-right: 5px;
    }
    .fa-check-circle {
      color: #1ab393;
    }
    &__date {
      color: #9d9d9d;
      flex: 0 0 135px;
    }
    &__icon {
      font-size: 17px;
    }

    &__body {
      flex: 1 1;

    }

    &__name {
      font-weight: bold;
    }
    &__action_label {
      display: flex;
    }
  }

  .bubble {
    display: inline-block;
    position: relative;
    padding: 5px 15px;
    background: #E5E5EA;
    border-radius: 25px;
    color: black;
    margin-bottom: 5px;
    &:before {
      content: "";
      position: absolute;
      z-index: 2;
      bottom: -2px;
      left: -7px;
      height: 20px;
      border-left: 20px solid #E5E5EA;
      border-bottom-right-radius: 16px 14px;
      -webkit-transform: translate(0, -2px);
    }

    &:after {
      content: "";
      position: absolute;
      z-index: 3;
      bottom: -2px;
      left: 21px;
      width: 10px;
      height: 20px;
      background: white;
      border-bottom-right-radius: 10px;
      -webkit-transform: translate(-30px, -2px);
    }
    &.me {
      background: #1ab394;
      color: #fff;

      &:before {
        border-left-color: #1ab394;
      }
    }
  }

  @media screen and (max-width: $screen-md-max) {
    .status-log {
      flex-flow: row wrap;
      &__body {
        flex-basis: 100%;
      }
    }
    .status-row {
      margin-bottom: 10px;
    }
  }
</style>
