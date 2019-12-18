<script>
  import { DateTime } from 'luxon';
  import { mapActions } from 'vuex';
  import { map } from 'lodash';

  import Card from 'Common/Card.vue';

  export default {
    name: 'OCFMultiPopup',

    props: {
      date: DateTime,
      ocfs: Array,
    },

    components: { Card },

    data() {
      return { data: [] };
    },

    created() {
      this.mapData();
    },

    computed: {
      title() {
        return `Other Commercial Flights, ${this.date.toLocaleString(DateTime.DATE_FULL)} (UTC)`;
      },
    },

    methods: {
      ...mapActions('fdt/ocf', ['createOCFs']),
      ...mapActions('fdt/calendar', ['getLegality']),

      async handleSaveClick() {
        const { date, data } = this;
        await this.createOCFs({ date, data });
        this.$emit('save');

        await this.getLegality(false);
      },

      handleAddOcf() {
        this.data.push({
          time: ['00:00', '23:59'],
          night_landed: false,
        });
      },

      handleDeleteOcf(idx) {
        if (idx !== -1) {
          this.data.splice(idx, 1);
        }
      },

      mapData() {
        const mapTime = (date) => {
          const { hour, minute, second } = DateTime.fromISO(date, { zone: 'utc' });
          const dt = this.date.set({ hour, minute, second });
          return dt.toFormat('HH:mm');
        };

        this.data = map(this.ocfs, ({ ocf }) => ({
          time: [
            mapTime(ocf.datetime_on),
            mapTime(ocf.datetime_off),
          ],
          night_landed: ocf.night_landed,
        }));
      },
    },

    watch: {
      ocfs: { handler: 'mapData', deep: true },
    },
  };
</script>

<template>
  <card class="fdt-ocf-multi" :title="title">
    <ul class="fdt-ocf-multi__items" v-if="data.length > 0">
      <li class="fdt-ocf-multi__item" v-for="(ocf, idx) in data" :key="idx">
        <el-time-picker
          class="fdt-ocf-multi__time-picker"
          v-model="ocf.time"
          size="small"
          is-range
          start-placeholder="Start Time"
          end-placeholder="End Time"
          value-format="HH:mm"
          format="HH:mm"
          clearable
        />

        <el-checkbox
          v-model="ocf.night_landed"
          class="fdt-ocf-multi__nl"
          size="small"
          label="Night Landing"
          border
        />

        <el-button
          class="fdt-ocf-multi__delete-button"
          size="small"
          icon="el-icon-close"
          @click="handleDeleteOcf(idx)"
        />
      </li>
    </ul>

    <p v-else>
      There's no OCFs for that day. Click "&plus;" to add new entries.
    </p>

    <div class="fdt-ocf-multi__buttons">
      <el-button type="primary" @click="handleSaveClick" size="small">Save</el-button>
      <el-button type="primary" @click="handleAddOcf" size="small" icon="el-icon-plus" />
    </div>
  </card>
</template>

<style lang="scss">
  .fdt-ocf-multi {
    margin-bottom: 0;

    &__items {
      list-style: none;
      padding-left: 0;
    }

    &__item {
      display: flex;
      margin-bottom: 5px;

      & > * {
        margin-right: 4px;
        margin-bottom: 0;

        &:first-child { margin-left: 0; }
      }
    }

    &__time-picker.el-date-editor--timerange.el-input__inner {
      width: 150px;
      flex: 1 1 50%;
    }

    &__delete-button {
       padding: 5px 10px;
    }

    &__buttons {
      display: flex;
      justify-content: space-between;
    }
  }
</style>
