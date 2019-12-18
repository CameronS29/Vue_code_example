<script>
  import { mapState, mapMutations, mapActions } from 'vuex';
  import BottomPopper from 'Common/BottomPopper.vue';

  import manageMixin from '../Common/manageMixin';

  import DutyList from '../Common/DutyList.vue';
  import DutyModal from './DutyModal.vue';
  import OcfModal from './OcfModal.vue';

  export default {
    name: 'CalendarManagePopup',

    mixins: [manageMixin],

    components: {
      BottomPopper,
      DutyList,
      DutyModal,
      OcfModal,
    },

    computed: {
      ...mapState('fdt/ocf', ['ocfs']),
      ...mapState('fdt/duties', ['duties']),
    },

    methods: {
      ...mapMutations('fdt/duties', ['setEditableDuty']),
      ...mapMutations('fdt/ocf', ['setEditableOCF']),
      ...mapActions('fdt/duties', ['getDuties', 'deleteDuty']),
      ...mapActions('fdt/ocf', ['getOCFs', 'deleteOCF']),

      handleAddNewDuty() {
        this.setEditableDuty({
          id: null,
          pilot: this.pilot,
          base: null,
          duty_on: new Date().toISOString(),
          duty_off: new Date().toISOString(),
        });
      },

      handleAddNewOCF() {
        this.setEditableOCF({
          id: null,
          pilot: this.pilot,
          datetime_on: new Date().toISOString(),
          datetime_off: new Date().toISOString(),
          night_landed: false,
        });
      },

      updateDuties() {
        if (!this.showDutyForm) return Promise.resolve();
        return Promise.all([this.getDuties(), this.getOCFs()]);
      },
    },
  };
</script>

<template>
  <bottom-popper :show="showDutyForm"
                 @close="handleCloseDutyForm"
                 title="Manage Duties"
                 header-height="50px">
    <duty-modal />
    <ocf-modal />

    <div class="fdt-calendar__duty-types">
      <duty-list :data="[]" title="Flight Duties" />

      <duty-list :data="duties" title="Other Company Duties" editable @add="handleAddNewDuty">
        <template slot="item" slot-scope="duty">
          <el-tag class="fdt-duty-list__type"
                  :type="dutyTagType(duty)"
                  size="mini">
            {{ dutyTagName(duty) }}
          </el-tag>
          <div class="fdt-duty-list__duty-times">
            {{ duty.duty_on | format }}Z &rarr; {{ duty.duty_off | format }}Z
          </div>
          <el-button size="mini"
                     class="fdt-duty-list__duty-edit-button"
                     icon="el-icon-edit"
                     @click="setEditableDuty(duty)" />
          <el-button @click="deleteDuty(duty.id)" size="mini" type="danger" icon="el-icon-delete" />
        </template>
      </duty-list>

      <duty-list :data="ocfs" title="Other Commercial Flights" editable @add="handleAddNewOCF">
        <template slot="item" slot-scope="ocf">
          {{ ocf.datetime_on | format }}Z &rarr; {{ ocf.datetime_off | format }}Z
          <span class="fdt-duty-list__ocf-night-landing"
                :title="ocf.night_landed ? 'Night Landing' : ''">
            {{ ocf.night_landed ? '🌑': '☀️' }}
          </span>
          <el-button size="mini"
                     class="fdt-duty-list__duty-edit-button"
                     icon="el-icon-edit"
                     @click="setEditableOCF(ocf)" />
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteOCF(ocf.id)" />
        </template>
      </duty-list>
    </div>
  </bottom-popper>
</template>

<style lang="scss">
  .fdt-calendar {
    &__duty-types {
      display: flex;
      flex-flow: row wrap;
      min-height: 250px;

      .el-button {
        padding: 7px;
        margin-left: 5px;
      }
    }
  }

  .fdt-duty-list {
    &__duty-times {
      margin-left: 5px;
    }

    &__type {
      width: 70px;
      text-align: center;
    }

    &__duty-edit-button.el-button {
      margin-left: auto;
    }

    &__ocf-night-landing {
      margin-left: auto;
    }
  }
</style>

