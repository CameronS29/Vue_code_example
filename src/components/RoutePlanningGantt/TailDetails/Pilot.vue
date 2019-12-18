<script>
  import { AIRCRAFT_TYPES, AIRCRAFT_TYPE_NAMES } from 'store/modules/dispatch/e-checklist';

  export default {
    props: {
      pilot: {
        type: Object,
        required: true,
      },
      aircraft: {
        type: Object,
        required: true,
      },
      activeFlight: {
        type: [Object, Boolean],
        default: false,
      },
    },
    computed: {
      prefix() {
        return AIRCRAFT_TYPES[this.aircraft.type.id];
      },
      typeName() {
        return AIRCRAFT_TYPE_NAMES[this.aircraft.type.id];
      },
      todayCurrency() {
        return this.pilot.pilot.currency_today;
      },
      lpv() {
        return this.todayCurrency.lpv;
      },
      currency() {
        return this.todayCurrency[this.prefix];
      },
      night() {
        return this.todayCurrency[`${this.prefix}_night`];
      },
      hmin() {
        return this.todayCurrency[`${this.prefix}_hmin`];
      },
      classes() {
        const ids = [];

        if (this.activeFlight.actual_pic) ids.push(this.activeFlight.actual_pic.id);
        if (this.activeFlight.actual_sic) ids.push(this.activeFlight.actual_sic.id);
        if (this.activeFlight.scheduled_pic) ids.push(this.activeFlight.scheduled_pic.id);
        if (this.activeFlight.scheduled_sic) ids.push(this.activeFlight.scheduled_sic.id);

        return {
          'crew-detailed_active': ids.includes(this.pilot.id),
        };
      },
      hMinClasses() {
        return {
          'crew-detailed__hmin': true,
          'crew-detailed__hmin_invalid': this.hmin,
        };
      },
      currenciesClasses() {
        return {
          'crew-detailed__currencies': true,
          'crew-detailed__currencies_gray': !this.pilot.pilot.is_pic,
        };
      },
    },
    data() {
      return {
        AIRCRAFT_TYPES,
        AIRCRAFT_TYPE_NAMES,
      };
    },
  };
</script>

<template>
  <div class="crew-detailed" :class="classes">
    <span class="crew-detailed__prop crew-detailed__name">
      <router-link target="_blank"
                   :to="{ name: 'fdt_calendar', params: { pilotId: pilot.pilot.id } }">
        {{ pilot.name }}
      </router-link>
    </span>
    <span class="crew-detailed__prop crew-detailed__rank">{{ pilot.pilot.is_pic ? 'PIC' : 'SIC' }}</span>
    <span class="crew-detailed__prop crew-detailed__base">{{ pilot.profile.base }}</span>

    <div :class="currenciesClasses">
      <span class="crew-detailed__prop">
        <strong>
          <i v-if="currency" class="fa fa-check" />
          <i v-else class="fa fa-times" />
        </strong>
        <div class="crew-detailed__title">{{ typeName }} currency</div>
      </span>
      <span class="crew-detailed__prop">
        <strong>
          <i v-if="night" class="fa fa-check" />
          <i v-else class="fa fa-times" />
        </strong>
        <div class="crew-detailed__title">{{ typeName }} night</div>
      </span>
      <span class="crew-detailed__prop">
        <strong :class="hMinClasses">
          {{ hmin ? 'H-min' : 'No' }}
        </strong>
        <div class="crew-detailed__title">H-min</div>
      </span>
      <span class="crew-detailed__prop">
        <strong>
          <i v-if="lpv" class="fa fa-check" />
          <i v-else class="fa fa-times" />
        </strong>
        <div class="crew-detailed__title">LPV</div>
      </span>
    </div>
  </div>
</template>


<style lang="scss">
  @import '../../../../scss/bs-variables';

  .crew-detailed {
    background: #ECF6F6;
    border-radius: 3px;
    margin-bottom: 5px;
    padding: 5px;
    display: flex;

    &_active {
      background: transparentize($yellow, .85);
    }

    &__prop {
      display: inline-block;
      text-align: center;
      &:not(:last-of-type) {
        margin-right: 5px;
      }
    }

    &__name {
      font-weight: bold;
    }

    &__title {
      opacity: .5;
      font-size: 11px;
      margin-right: 3px;
    }

    &__currencies {
      margin-left: auto;

      &_gray {
        .crew-detailed__prop {
          &:not(:first-of-type) {
            filter: grayscale(1);
          }
        }
      }
    }

    .fa {
      font-size: 18px;
    }

    .fa-check {
      color: $navy;
    }
    .fa-times {
      color: $red;
    }

    &__hmin {
      color: $navy;
      &_invalid {
        color: $red;
      }
    }
  }
</style>
