<script>
  import {mapActions, mapGetters, mapMutations} from 'vuex';
  import {required} from 'vuelidate/lib/validators';
  import {
    mapFormIntField,
    mapFormDateField,
  } from 'store/helpers/forms';

  import Block from 'Common/Block.vue';
  import Errors from 'Common/Form/Errors.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import Group from 'Common/Form/Group.vue';
  import GroupSplit from 'Common/Form/GroupSplit.vue';
  import {DateTime} from 'luxon';
  import {UPDATE_REQUEST} from 'store/modules/scheduling/open-time';
  import {FlightList} from 'Common/FlightPicker';
  import FlightDetails from '../../../Flight/Status/FlightDetails.vue';
  import {connectMixin} from '../../../../sockets';

  export default {
    mixins: [
      connectMixin(({id}) => `opentime:${id}`),
    ],
    props: {
      id: Number,
    },
    computed: {
      ...mapGetters('scheduling/openTime', ['request']),
      ...mapGetters('user', ['user', 'isPilot', 'isPIC', 'isSIC', 'isAdmin', 'isScheduler']),
      dateFrom() {
        return DateTime.fromISO(this.request.duty_start, {zone: 'UTC'});
      },
      dateTo() {
        return DateTime.fromISO(this.request.duty_end, {zone: 'UTC'});
      },
      hasSchedulerAccess() {
        return this.isScheduler || this.isAdmin;
      },
      isPending() {
        return this.request.status === 0;
      },
      isAccepted() {
        return this.request.status === 1;
      },
      isApproved() {
        return this.request.status === 2;
      },
      isDeclined() {
        return this.request.status === 3;
      },
      isPilotInList() {
        return this.isPilotRestricted && (this.isPIC || this.request.position === 1);
      },
      isPilotRestricted() {
        return this.isPilot && !this.isAdmin;
      },
    },
    methods: {
      ...mapActions('scheduling/openTime', [
        'getPilotOptions', 'updateOpenTime', 'getOpenTime', 'cancelOpenTime', 'declineOpenTime', 'approveOpenTime',
        'acceptOpenTime',
      ]),
      ...mapMutations('scheduling/openTime', [UPDATE_REQUEST]),
      async handleSubmit() {
        this.$v.$touch();
        if (!this.$v.$invalid) {
          await this.updateOpenTime();
        }
      },
      formatDate(date) {
        return DateTime.fromISO(date, {zone: 'UTC'}).toFormat('FFF');
      },
      async handleCancel() {
        this.$confirm('This will close request. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }).then(() => {
          this.cancelOpenTime().then(() => {
            this.$message({
              type: 'success',
              message: 'Request was canceled',
            });
          });
        });
      },
      async handleAccept() {
        this.$confirm('You\'re about to accept this request. Are you sure?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }).then(() => {
          this.acceptOpenTime().then(() => {
            this.$message({
              type: 'success',
              message: 'You accepted this open time request.' +
              'The scheduling team is reviewing the request and will confirm the assignment shortly',
            });
          });
        });
      },
      async handleApprove() {
        this.$confirm(`You're about to accept ${this.request.accepted_pilot_info.name} as pilot. Are you sure?`, 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }).then(() => {
          this.approveOpenTime().then(() => {
            this.$message({
              type: 'success',
              message: 'You accepted this pilot.',
            });
          });
        });
      },
      async handleDecline() {
        this.$confirm(`You're about to decline ${this.request.accepted_pilot_info.name} as pilot. Are you sure?`, 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }).then(() => {
          this.declineOpenTime().then(() => {
            this.$message({
              type: 'success',
              message: 'You accepted this open time request.' +
              'The scheduling team is reviewing the request and will confirm the assignment shortly',
            });
          });
        });
      },
    },
    components: {
      Block,
      Group,
      GroupSplit,
      Errors,
      VerticalForm,
      FlightDetails,
      FlightList,
    },
    created() {
      if (this.id) {
        this.getOpenTime(this.id);
      }
    },
  };
</script>

<template>
  <div>
    <portal to="header">
      <div>
        <router-link :to="{ name: 'open_time_list' }">
          <el-button type="primary"
                     icon="el-icon-tickets"
                     size="small"
                     round>
            List all requests
          </el-button>
        </router-link>
        <router-link :to="{ name: 'open_time_create' }"
                     v-if="isAdmin || isScheduler">
          <el-button type="primary"
                     icon="el-icon-plus"
                     size="small"
                     round>
            Create New Request
          </el-button>
        </router-link>
      </div>
    </portal>
    <div class="open-time__warning"
         v-if="request.accepted_pilot !== user.id && !isPending && !isDeclined && isPilotRestricted">
      This request was accepted by a different crew member
    </div>
    <div class="open-time__warning" v-if="request.accepted_pilot === user.id">
      If you can no longer take this open request, please, contact the scheduling team
    </div>
    <block no-padding="true">
      <template slot="title" class="open-time__header">
        <div class="open-time__title">
          Open time request #{{ id }}
          <span
            v-if="request.request_date">from {{ formatDate(request.request_date) }}</span>
        </div>
        <div class="open-time__actions">
          <el-button icon="el-icon-success" type="success" @click="handleApprove" size="mini"
                     v-if="isAccepted && hasSchedulerAccess">
            Approve {{ request.accepted_pilot_info.name }}
          </el-button>
          <el-button icon="el-icon-error" type="warning" @click="handleDecline" size="mini"
                     v-if="isAccepted && hasSchedulerAccess">
            Decline {{ request.accepted_pilot_info.name }}
          </el-button>
          <el-button type="danger" @click="handleCancel" size="mini"
                     v-if="!isApproved && !isDeclined && hasSchedulerAccess">
            Cancel Request
          </el-button>
          <div v-if="isPilotInList">
            <el-button icon="el-icon-success" type="success" @click="handleAccept" size="mini" v-if="isPending">
              Accept
            </el-button>
          </div>
        </div>
      </template>
      <div class="open-time">
        <div class="open-time__basic">
          <div class="open-time__request">
            <el-tag v-if="request.priority === 0" type="danger">IMMEDIATE priority</el-tag>
            <el-tag v-else-if="request.priority === 1" type="warning">Urgent priority</el-tag>
            <el-tag v-else-if="request.priority === 2" type="info">Medium priority</el-tag>
            <el-tag v-else-if="request.priority === 3" type="info">Low priority</el-tag>
            <el-tag v-if="request.base_info">Base: {{ request.base_info.iata }}</el-tag>
            <el-tag v-if="request.position === 0">Position: PIC</el-tag>
            <el-tag v-if="request.position === 1">Position: SIC</el-tag>
          </div>
          <div class="open-time__duty">
            <div class="duty-badge">
              <span class="duty-badge__daymonth">{{ dateFrom.month }}/{{ dateFrom.day }}</span>
              <span class="duty-badge__year">/{{ dateFrom.year }}</span>
              <span class="duty-badge__time">{{ dateFrom.toFormat('HH:mm') }}</span>
            </div>
            <div class="open-time__duty-to">
              to
            </div>
            <div class="duty-badge">
              <span class="duty-badge__daymonth">{{ dateTo.month }}/{{ dateTo.day }}</span>
              <span class="duty-badge__year">/{{ dateTo.year }}</span>
              <span class="duty-badge__time">{{ dateTo.toFormat('HH:mm') }}</span>
            </div>
          </div>
        </div>
        <div class="open-time__details">
          <div class="open-time__section" v-if="!isPilotRestricted">
            <strong>Invited pilots</strong>
            <span class="open-time__pilot-list">
              <span v-for="pilot in request.pilots_info">{{ pilot.name }}</span>
            </span>
          </div>
          <group-split>
            <div class="open-time__section">
              <strong>Created By</strong>
              <span>
                {{ request.user_info.first_name }}
                {{ request.user_info.last_name }}
              </span>
            </div>
            <div class="open-time__section">
              <strong>Status</strong>
              <span v-if="isPending" class="open-time__status open-time__status_pending">
                Waiting for pilot to accept
              </span>
              <span v-if="isAccepted" class="open-time__status open-time__status_accepted">
                Accepted by <span class="open-time__accepter">{{ request.accepted_pilot_info.name }}</span>
              </span>
              <span v-if="isApproved" class="open-time__status open-time__status_reviewed">
                Accepted by <span class="open-time__accepter">{{ request.accepted_pilot_info.name }}</span>. Approved by scheduled
              </span>
              <span v-if="isDeclined" class="open-time__status open-time__status_cancelled">
                Canceled by scheduler
              </span>
            </div>
          </group-split>
        </div>
      </div>
    </block>
    <block title="Flights">
      <flight-list
        v-if="request.flights_info.length"
        :flights="request.flights_info"/>
    </block>

    <flight-details/>
  </div>
</template>

<style scoped lang="scss">
  .block__contents_no-padding {
    padding: 0 !important;
  }

  .open-time {
    display: flex;
    padding: 15px;
    &__pilot-list {
      > span {
        display: inline-block;
        margin-right: 3px;
        &:after {
          display: inline-block;
          content: ', ';
        }
        &:last-child {
          &:after {
            content: '.';
          }
        }
      }
    }
    &__warning {
      background-color: #fdf6ec;
      color: #e6a23c;
      padding: 15px;
      font-size: 18px;
    }
    &__title {
      flex: 1 0;
    }
    &__request {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      span {
        margin-right: 4px;
      }
    }
    &__section {
      strong {
        display: block;
        color: #979797;
      }
      margin-bottom: 5px;
    }
    &__duty-to {
      margin: 0 10px;
    }
    &__accepter {
      font-weight: bold;
    }
    &__duty {
      display: flex;
      align-items: center;
    }
    &__basic {
      margin-right: 20px;
    }
    &__status {
      font-size: 16px;
      &_pending {
        color: #E1C643;
      }
      &_accepted {
        color: #30bf32;
      }
      &_reviewed {
        color: #30bf32;
      }
      &_cancelled {
        color: #e47470;
      }
    }
  }

  .duty-badge {
    background: #EFF6F6;
    border: 1px solid #D2DCDC;
    border-radius: 3px;
    display: inline-flex;
    font-size: 12px;
    align-items: center;
    padding: 3px 5px;
    &__daymonth {
      color: #5D5656;
      font-weight: bold;
    }
    &__year {
      color: #B1AEAE;
      margin-right: 3px;
      font-weight: bold;
    }
    &__time {
      color: #737373;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .group-split {
    .open-time__section {
      margin-right: 20px;
    }
  }
</style>
