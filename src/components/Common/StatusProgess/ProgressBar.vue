<script>
  import get from 'lodash/get';
  import isFunction from 'lodash/isFunction';
  import {STATUS_PENDING, STATUS_ACTIVE, STATUS_COMPLETED} from './consts';

  export default {
    props: {
      step: {
        type: [String, Number],
        required: true,
      },

      completed: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {progress: 0};
    },

    mounted() {
      this.updateInternalStatus();
    },

    computed: {
      statusItems() {
        return this.$slots.default
          .filter(el => (get(el, ['componentOptions', 'tag']) === 'status-item'))
      },

      itemWidth() {
        return 100 / Math.max(this.statusItems.length, 1);
      },
    },

    methods: {
      updateInternalStatus() {
        const statusItems = this.statusItems
          .map(el => el.componentInstance);

        let progress = 0;
        statusItems.reduceRight((currentStatus, el, idx) => {
          if (currentStatus === STATUS_ACTIVE) {
            progress = idx + 1;
            currentStatus += 1;
          } else if (el.step === this.step) {
            currentStatus += 1;
          }
          el.setStatus(currentStatus);
          return currentStatus;
        }, STATUS_PENDING);

        this.progress = (100 * progress) / Math.max(statusItems.length - 1, 1);
        if ((progress + 1) === statusItems.length && this.completed) {
          statusItems[progress].setStatus(STATUS_COMPLETED);
        }
      },
    },

    watch: {
      step: 'updateInternalStatus',
      completed: 'updateInternalStatus',
      'slots.$default': 'updateInternalStatus',
    },

    render(h) {
      return (
        <div class="status-progress">
          <div class="status-progress__progress-bar" style={{
            left: `${this.itemWidth / 2}%`,
            right: `${this.itemWidth / 2}%`,
          }}>
            <div class="status-progress__inner-progress" style={{ width: `${this.progress}%` }} />
          </div>
          <div class="status-progress__status-items">
            {this.statusItems.map((statusItem, idx) => (
              <div key={idx} class="status-progress__item-wrapper" style={{ width: `${this.itemWidth}%` }}>
                {statusItem}
              </div>
            ))}
          </div>
        </div>
      );
    },
  };
</script>

<style lang="scss">
  @import '../../../../scss/variables';
  @import '../../../../scss/bs-variables';

  $animation-duration: .5s;
  $item-size: 50px;
  $progress-height: 12px;

  .status-progress {
    margin: 15px 0;
    position: relative;

    &__progress-bar {
      height: $progress-height;
      background-color: $inactive-bar;
      border-radius: 3px;
      overflow: hidden;

      top: ($item-size - $progress-height) / 2;
      left: 0;
      right: 0;
      position: absolute;
    }

    &__inner-progress {
      left: 0;
      top: 0;
      bottom: 0;
      position: absolute;
      background-color: $navy;
      transition: width $animation-duration;

      &::after {
        display: block;
        content: '';
        width: 10px;
        top: 0;
        bottom: 0;
        right: -5px;
        position: absolute;
        background: linear-gradient(to right, $navy, $inactive-bar);
      }
    }

    &__item-wrapper {
      position: relative;
      display: inline-block;
      left: 0;
      top: 0;
    }
  }
</style>
