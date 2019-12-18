<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    mounted() {
      this.getAllOptions();
    },

    computed: {
      ...mapGetters('wb', [
        'availableAircraftTypes'
      ]),
    },

    methods: {
      ...mapActions('wb', [
        'getAllOptions'
      ]),
    },
  };
</script>

<template>
  <div class="landing-layout">
    <div class="box wb__box">
      <div class="series">Identify the aircraft and series that wil be operating that flight</div>
      <div class="aircraft-types" v-if="availableAircraftTypes">
        <router-link v-for="{ name, id } in availableAircraftTypes" :key="id"
                     :to="{ name: 'wb_list', params: { type: id } }">{{ name }}
        </router-link>
      </div>
      <div v-else>
        <i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>
      </div>
    </div>
    <div class="box wb__box">
      <div class="heading">Overview</div>
      <div class="text">
        Boutique Air has developed a proprietary Weight & Balance calculation software, which provides a higher
        degree of reliability and user-friendliness for every takeoff. CSA’s, Pilots, and Dispatchers can not
        only create a new WB, but also review the completed details for the Center of Gravity calculations,
        passenger/luggage weight, check for accuracy, and search historical records of previously-completed WBs.
        Email <a href="mailto:engfeedback@boutiqueair.com">engfeedback@boutiqueair.com</a> the engineering team
        with feedback.
      </div>

      <div class="heading">Tips</div>
      <div class="tips">
        <div class="tip">
          <div class="num">1</div>
          <div class="tip-description">
            <div class="screenshot floated rounded">
              <img src="/static/img/guide/wb-guide-1.png" alt="Drag & Drop">
            </div>
            Drag and drop passengers seats to adjust center of gravity on the aircraft
          </div>
        </div>
        <div class="tip">
          <div class="num">2</div>
          <div class="tip-description">
            <p>
              Below are the steps a new WB log will go through until it is completed
            </p>
            <div class="screenshot ">
              <img src="/static/img/guide/wb-guide-2.png" alt="Statuses">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../scss/bs-variables";

  .landing-layout {
    max-width: 700px;
  }

  .heading {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
  }

  .tips {
    .tip {
      margin-bottom: 10px;
      display: flex;
      flex-flow: row nowrap;
      .screenshot {
        img {
          max-width: 100%;
        }
        &.floated {
          float: right;
          margin-right: 10px;
        }
        &.rounded {
          img {
            border-radius: 50px;
          }
        }
      }
      .num {
        width: 30px;
        height: 30px;
        text-align: center;
        background: #2f4050;
        border-radius: 15px;
        padding-top: 4px;
        color: #fff;
        font-size: 16px;
        margin-right: 20px;
        flex: 0 0 30px;
      }
      .tip-description {
        flex: 1 0;
        color: #0e0b2a;
        background: #eff4ff;
        font-size: 15px;
        padding: 10px;
        margin-right: -30px;
      }
    }
  }

  .box.wb__box {
    background: #fff;
    padding: 30px;
    margin-bottom: 15px;
    .text {
      margin-bottom: 10px;
    }
    .series {
      font-weight: bold;
      color: #000;
      font-size: 15px;
      margin-bottom: 10px;
    }
  }

  .aircraft-types {
    display: flex;
    flex-flow: row nowrap;
    a {
      flex: 1 1;
      background: #1cb692;
      color: #fff;
      border-radius: 10px;
      height: 90px;
      padding-top: 35px;
      text-align: center;
      font-size: 16px;
      font-weight: 400;
      transition: background 200ms;
      &:hover {
        background: #199374;
        color: #fff;
      }
      &:not(:last-of-type) {
        margin-right: 15px;
      }
    }
  }
</style>
