<script>
  import filter from 'lodash/filter';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import Collapse from 'Common/Collapse.vue';
  import FlightView from './Partials/Flight.vue';
  import SearchDetailView from './Partials/SearchDetail.vue';

  export default {
    props: {
      id: {
        type: [Number, String],
      }
    },
    components: {
      FlightView,
      SearchDetailView,
      Collapse,
    },

    computed: {
      ...mapGetters('security', [
        'reasons',
        'internalCheckList',
        'externalCheckList'
      ]),
      ...mapGetters('security', [
        'item',
        'loading'
      ]),
      aircraftType() {
        return this.item.aircraft_type_name;
      },
      internalCheckItems() {
        if (this.aircraftType) {
          return filter(this.internalCheckList, c=>c.id.indexOf(this.aircraftType) > -1);
        } else {
          return [];
        }
      },
      externalCheckItems() {
        if (this.aircraftType) {
          return filter(this.externalCheckList, c=>c.id.indexOf(this.aircraftType) > -1);
        } else {
          return [];
        }
      },
    },

    methods: {
      ...mapActions('security', [
        'getSecurityItem',
        'getSecurityOptions'
      ]),
    },
    mounted() {
      this.getSecurityItem(this.id);
    },
    created() {
      if (this.reasons.length == 0) {
        this.getSecurityOptions();
      }
    },
    watch: {
      id(newId, oldId) {
        this.getSecurityItem(newId);
      }
    }
  };
</script>

<template>
  <div class="securityForm"v-if="!loading">
    <div class="securityForm__notice">
      SENSITIVE SECURITY INFORMATION
      WARNING: THIS RECORD CONTAINS SENSITIVE SECURITY INFORMATION THAT IS CONTROLLED UNDER 49 C.F.R. PARTS 15 AND 1520. NO PART OF THIS RECORD MAY BE DISCLOSED TO PERSONS WITHOUT A "NEED TO KNOW," AS DEFINED IN 49 C.F.R. PARTS 15 AND 1520, EXCEPT WITH THE WRITTEN PERMISSION OF THE ADMINISTRATOR OF THE TRANSPORTATION SECURITY ADMINISTRATION OR THE SECRETARY OF TRANSPORTATION. UNAUTHORIZED RELEASE MAY RESULT IN CIVIL PENALTIES OR OTHER ACTION. FOR U.S. GOVERNMENT AGENCIES, PUBLIC DISCLOSURE GOVERNED BY 5 U.S.C. 552 AND 49 C.F.R. PARTS 15 AND 1520.
    </div>

    <collapse title="Flight Details">
      <flight-view />
    </collapse>

    <collapse :title="`Search details: Internal ${aircraftType}`">
      <search-detail-view field="internal_check" label="internal"
        :checkList="internalCheckItems" :aircraftType="aircraftType" ref="internalSearch" />
    </collapse>

    <collapse :title="`Search details: External ${aircraftType}`">
      <search-detail-view field="external_check" label="external"
        :checkList="externalCheckItems" :aircraftType="aircraftType" ref="externalSearch" />
    </collapse>
  </div>
</template>
<style lang="scss">
  .securityForm {
    padding: 25px;
    font-size: 15px;

    &__notice {
      border-radius: 8px;
      background: #fdf6ec;
      font-size: 15px;
      color: #d98f23;
      padding: 10px;
      margin-bottom: 15px;
    }

    &__confirm {
      margin-left: 20px;
    }
  }
</style>
