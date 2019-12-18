<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'SocketConnectionStatus',

    computed: {
      ...mapGetters('sock', [
        'isConnecting',
        'isOpen',
        'isClosed',
      ]),

      statusTitle() {
        if (this.isOpen) {
          return 'Real-Time Connection Established';
        } else if (this.isConnecting) {
          return 'Connecting...';
        }
        return 'Could not Establish Real-Time Connection';
      },

      statusClasses() {
        return {
          'socket-connection-status_offline': this.isClosed,
          'socket-connection-status_connecting': this.isConnecting,
          'socket-connection-status_online': this.isOpen,
        };
      },
    },
  };
</script>

<template>
  <div class="socket-connection-status" :class="statusClasses" :title="statusTitle">
    <svg class="socket-connection-status__icon" viewBox="0 0 57 57" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <g v-if="isOpen" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill-rule="nonzero" fill="#777">
          <path d="M7.789,50.068 C9.668,51.945 12.135,52.884 14.602,52.884 C17.071,52.884 19.538,51.945 21.416,50.064 L34.965,36.511 C36.787,34.691 37.789,32.275 37.789,29.698 C37.787,27.128 36.787,24.708 34.965,22.887 L30.844,18.764 L27.239,22.369 L31.36,26.492 C32.217,27.349 32.69,28.488 32.69,29.699 C32.69,30.908 32.217,32.047 31.36,32.904 L17.809,46.459 C16.039,48.227 13.163,48.227 11.393,46.459 L7.272,42.336 C5.502,40.568 5.502,37.691 7.272,35.92 L14.045,29.145 L10.44,25.54 L3.665,32.315 C-0.091,36.075 -0.089,42.186 3.665,45.942 L7.789,50.068 Z" id="Shape"></path>
          <path d="M46.059,3.555 C44.239,1.733 41.821,0.729 39.246,0.729 C39.244,0.729 39.244,0.729 39.242,0.729 C36.668,0.729 34.248,1.733 32.428,3.551 L18.881,17.102 C17.057,18.924 16.053,21.342 16.053,23.918 C16.053,26.49 17.055,28.912 18.877,30.731 L22.998,34.852 L26.605,31.247 L22.482,27.126 C21.627,26.271 21.152,25.13 21.152,23.919 C21.152,22.706 21.627,21.567 22.484,20.712 L36.035,7.157 C36.89,6.302 38.029,5.829 39.244,5.829 C39.244,5.829 39.244,5.829 39.246,5.829 C40.455,5.829 41.594,6.302 42.451,7.157 L46.572,11.282 C47.427,12.137 47.9,13.276 47.9,14.489 C47.9,15.698 47.427,16.841 46.572,17.696 L39.797,24.473 L43.402,28.078 L50.177,21.301 C51.997,19.483 52.999,17.061 53.001,14.488 C53.001,11.914 51.997,9.494 50.177,7.675 L46.059,3.555 Z" id="Shape"></path>
        </g>
      </g>

      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" v-else>
        <g fill-rule="nonzero" fill="#777">
          <path d="M2.27,41.129 C2.268,43.705 3.27,46.125 5.09,47.942 L9.213,52.069 C11.092,53.946 13.561,54.882 16.027,54.882 C18.496,54.882 20.965,53.946 22.841,52.066 L31.534,43.371 L27.929,39.766 L19.236,48.461 C17.468,50.229 14.588,50.231 12.82,48.461 L8.695,44.338 C7.84,43.481 7.369,42.342 7.369,41.133 C7.369,39.922 7.84,38.779 8.697,37.922 L17.486,29.135 L13.881,25.528 L5.092,34.317 C3.271,36.139 2.27,38.555 2.27,41.129 Z" />
          <path d="M38.584,29.109 L42.189,32.714 L51.607,23.3 C55.361,19.542 55.361,13.429 51.605,9.675 L47.484,5.554 C45.666,3.732 43.246,2.728 40.671,2.728 C40.669,2.728 40.669,2.728 40.667,2.728 C38.095,2.728 35.675,3.734 33.856,5.554 L24.018,15.388 L27.623,18.993 L37.461,9.159 C38.318,8.302 39.457,7.827 40.668,7.827 C40.668,7.827 40.668,7.827 40.67,7.827 C41.881,7.827 43.02,8.3 43.875,9.159 L48,13.281 C49.766,15.047 49.766,17.926 48,19.695 L38.584,29.109 Z" />
          <rect transform="translate(10.619226, 11.280603) rotate(-134.983794) translate(-10.619226, -11.280603) " x="4.99678005" y="9.58061919" width="11.2448926" height="3.39996753" />
          <rect transform="translate(5.688688, 22.779518) rotate(-1.398159) translate(-5.688688, -22.779518) " x="0.175200793" y="21.0790221" width="11.0269749" height="3.40099226" />
          <rect transform="translate(22.157338, 6.314458) rotate(90.979760) translate(-22.157338, -6.314458) " x="16.684585" y="4.61387902" width="10.9455058" height="3.40115716" />
          <rect transform="translate(45.672900, 46.334257) rotate(45.000000) translate(-45.672900, -46.334257) " x="40.0519537" y="44.6342731" width="11.2418922" height="3.39996739" />
          <rect transform="translate(34.175015, 51.262320) rotate(91.392431) translate(-34.175015, -51.262320) " x="28.6635407" y="49.561828" width="11.0229481" height="3.40098398" />
          <rect transform="translate(50.645133, 34.801205) rotate(-0.991217) translate(-50.645133, -34.801205) " x="45.1743609" y="33.1016206" width="10.9415432" height="3.39916876" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
  .socket-connection-status {
    width: 28px;
    height: 28px;
    padding: 6px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.06);
    overflow: hidden;

    margin-top: 10px;
    margin-bottom: -10px;
    margin-right: 10px;

    &_offline {
      background: rgba(0, 0, 0, 0.03);
    }

    &_connecting {
      background: rgba(255, 255, 0, 0.08);
    }

    &_online {
      background: rgba(0, 255, 0, 0.08);
    }


    &__icon {
      width: 100%;
      height: 100%;
    }
  }
</style>

