<script>
  import {Row, Col, Select, Option} from 'element-ui';
  import {mapActions, mapMutations, mapState} from "vuex";
  import Datepicker from '../../fields/Datepicker.vue';
  import Icon from 'Common/Icon.vue';
  import Block from 'Common/Block.vue';
  import Bttn from 'Common/Button.vue';
  import {mapFormDateField} from "../../../store/helpers/forms";
  import {SET_FIELD} from "../../../store/modules/flights/sync";
  import FlightDetails from '../../Flight/Status/FlightDetails.vue';
  import {DateTime} from "luxon";
  import {connectMixin} from "../../../sockets";

  export default {
    components: {
      ElRow: Row,
      ElCol: Col,
      ElSelect: Select,
      ElOption: Option,
      Datepicker,
      Block,
      Bttn,
      Icon,
      FlightDetails
    },
    computed: {
      ...mapFormDateField("flights/sync/form", "flights/sync/" + SET_FIELD, ["start", "end"]),
      ...mapState("flights/sync", [
        'syncs',
        'syncId',
        'task'
      ]),
      thisMonthName() {
        return DateTime.local().toFormat("MMMM");
      },
      nextMonthName() {
        return DateTime.local().set({day:1}).plus({month: 1}).toFormat("MMMM");
      }
    },
    data(){
      return {
        progress: false
      }
    },
    methods: {
      ...mapActions("flights/sync", ["startSyncing", "getExternalSyncs", "getSyncCommits"]),
      selectSync(syncId) {
        this.getSyncCommits(syncId);
      },
      setCurrentMonth(){
        const start = DateTime.local().set({day:1, minute:0});
        const end = DateTime.local().set({day:1}).plus({month: 1}).minus({day:1});
        this.start = start.toFormat("MM/dd/yyyy");
        this.end = end.toFormat("MM/dd/yyyy");
      },
      async sync() {
        this.progress = true;
        const task_info = await this.startSyncing();
        console.log(task_info);
        this.selectSync(task_info.sync.id);
        this.progress = false;

      },
      setNextCurrentMonth(){
        const start = DateTime.local().set({day:1, minute:0});
        const end = DateTime.local().set({day:1}).plus({month: 2}).minus({day:1});
        this.start = start.toFormat("MM/dd/yyyy");
        this.end = end.toFormat("MM/dd/yyyy");
      },
      setNextMonth(){
        const start = DateTime.local().set({day:1, minute:0}).plus({month: 1});
        const end = DateTime.local().set({day:1}).plus({month: 2}).minus({day:1});
        this.start = start.toFormat("MM/dd/yyyy");
        this.end = end.toFormat("MM/dd/yyyy");
      },
    },
    watch: {
      syncId() {
        this.$router.push({ name: 'historical_sync', params: { id: this.syncId } })
      }
    },
    filters: {
      shortDate(date) {
        return DateTime.fromISO(date, {zone: 'utc'}).toFormat("LLL dd hh:mm a");
      },
    },
    mounted() {
      this.getExternalSyncs();
    }
  };
</script>

<template>
  <div>
    <div class="sync-layout">
      <block title="Sync with videcom" class="sync-layout__sync-input"
             v-loading="progress">
        <div class="date-sync-form">
          <div class="date-sync-form__label">
            Date range
          </div>
          <datepicker v-model="start"></datepicker>
          <div class="date-sync-form__sep">—</div>
          <datepicker v-model="end"></datepicker>
          <div class="date-sync-form__shortcuts">
            <a href="#" @click="setCurrentMonth">This month ({{thisMonthName}})</a>
            <a href="#" @click="setNextMonth">Next month ({{nextMonthName}})</a>
            <a href="#" @click="setNextCurrentMonth">{{thisMonthName}}-{{nextMonthName}}</a>
          </div>
          <bttn @click="sync">Sync</bttn>
        </div>
      </block>
      <block title="Recent syncs" class="sync-layout__history">
        <div class="recent-syncs">
          <div class="recent-syncs__sync" v-for="sync in syncs">
            <div class="recent-syncs__date">
              <router-link :to="{ name: 'historical_sync', params: { id: sync.id } }" @click="selectSync(sync.id)">
                {{ sync.sync_time | shortDate }}
              </router-link>
            </div>
            <div class="recent-syncs__daterange">
              <icon glyph="calendar"></icon>
              {{ sync.start }}–{{ sync.end }}
            </div>
          </div>
        </div>
      </block>
    </div>
    <router-view/>

    <flight-details />
  </div>
</template>

<style lang="scss">
  .sync-layout {
    display: flex;
    flex-flow: row nowrap;
    &__sync-input {
      margin-right: 20px;
      flex: 0 0 770px;
    }
    &__history {
      flex: 1 1;

      .block__contents {
        padding-bottom: 0;
        position: relative;
        &:after {
          content: ' ';
          position: absolute;
          bottom: 0;
          left:0;
          width: 100%;
          height: 3px;
          background: linear-gradient(rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.20));
        }
      }
    }
  }

  .date-sync-form {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    .datepicker {
      margin-bottom: 0;
      flex: 0 1 200px;
    }
    &__label {
      flex: 0 0 80px;
    }
    &__sep {
      margin: 0 5px;
    }
    &__shortcuts {
      display: flex;
      flex-flow: row nowrap;
      flex: 0 0 280px;
      margin-left: 10px;
      a {
        margin-right: 5px;
        border-bottom: 1px dashed rgba(51, 122, 183, 0.36);
      }
    }
  }

  .recent-syncs {
    overflow: scroll;
    max-height: 50px;
    display: flex;
    flex-flow: row wrap;
    &__sync {
      display: flex;
      flex-flow: row nowrap;
      flex-basis: 275px;
    }
    &__date {
      margin-right: 10px;
    }
    &__daterange {
      color: #9C9C9C;
    }
  }
  @media (max-width: 1200px) {
    .sync-layout {
      &__sync-input {
        margin-right: 20px;
        flex: 1 0;
      }
      &__history {
        flex: 0 0 310px
      }
    }
    .date-sync-form {
      flex-flow: row wrap;
    }
  }

</style>
