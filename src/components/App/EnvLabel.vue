<script>
  import { findKey } from 'lodash';

  const ENV_DOMAIN_MAP = {
    staging: /^bops\.boutiqueair\.com/,
    training: /^opstraining\.boutiqueair\.com/,
    release: /^r\d/,
    feature: /\w\.bops\.boutiqueair\.com/,
  };

  export default {
    created() {
      let title = document.title;

      if (this.env === 'staging') {
        title = document.title.replace('FLTOPS', 'BOPS');
      } else if (this.env === 'training') {
        title = document.title.replace('FLTOPS', 'Training');
      } else if (this.env === 'release') {
        title = document.title.replace('FLTOPS',
          window.location.host.match(/([\w.]+)\.bops\.boutiqueair\.com/)[1]);
      } else if (this.env === 'feature') {
        title = document.title.replace('FLTOPS', window.location.host.split('.')[0]);
      }

      document.title = title;
    },
    computed: {
      env() {
        return findKey(ENV_DOMAIN_MAP, re => re.test(window.location.host));
      },
      spanClass() {
        return {
          'env-label__span': true,
          [`env-label__span_${this.env}`]: !!this.env,
        };
      },
    },
  };
</script>

<template>
  <div
    v-if="env"
    class="env-label">
    <portal to="bottom-right-foreground" :order="90">
      <span :class="spanClass">{{ env }} env</span>
    </portal>
    <portal to="bottom-right" :order="90">
      <span :class="spanClass">{{ env }} env</span>
    </portal>
  </div>
</template>

<style lang="scss">
  @import '../../../scss/bs-variables';

  .env-label {
    &__span {
      padding: 8px 20px;
      display: block;
      color: #fff;
      &_staging {
        background: $black;
      }
      &_training {
        background: $blue;
      }
      &_release {
        background: $yellow;
        color: $black;
      }
      &_feature {
        background: $red;
      }
    }
  }
</style>
