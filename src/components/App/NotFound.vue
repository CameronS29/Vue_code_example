<script>
  export default {
    name: 'NotFound',
  };
</script>

<template>
  <div class="fltops-not-found">
    <div class="fltops-not-found__art">
      <svg width="175px" height="175px" viewBox="0 0 351 351" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="stop" fill="none" fill-rule="evenodd">
          <g id="bg" stroke="#676A6C" stroke-width="5">
            <g>
              <circle cx="175.5" cy="175.5" r="173"></circle>
              <circle cx="176" cy="176" r="121.5"></circle>
              <circle cx="175.5" cy="175.5" r="68"></circle>
            </g>
            <g transform="translate(0.000000, 2.000000)" stroke-linecap="square">
              <g transform="translate(0.000000, 174.000000)">
                <path d="M0.5,1.5 L21.523796,1.5"></path>
                <path d="M329.5,1.5 L350.523796,1.5"></path>
              </g>
              <g
                transform="translate(175.500000, 175.500000) rotate(-90.000000) translate(-175.500000, -175.500000) translate(0.000000, 174.000000)">
                <path d="M0.5,1.5 L21.523796,1.5"></path>
                <path d="M329.5,1.5 L350.523796,1.5"></path>
              </g>
            </g>
          </g>
        </g>
      </svg>

      <svg id="radar-spin" width="87.5px" height="87.5px" viewBox="0 0 87.5 87.5" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-blur" x1="0" y1="1" x2="0.7" y2="0">
            <stop offset="0%" stop-color="#676A6C"/>
            <stop offset="70%" stop-color="#676A6C" stop-opacity="0" />
          </linearGradient>
        </defs>
        <circle fill="#676A6C" r="4.5" cx="4.5" cy="4.5"></circle>
        <path d="M65.37 65.37 A 65.37 65.37 0 0 0 84.5 33.18 L 4.5 4.5 Z" fill="url(#line-blur)" opacity="0.5"></path>
        <line x1="4.5" y1="4.5" x2="65.37" y2="65.37" stroke="#676A6C" stroke-width="2px"></line>
      </svg>

      <svg id="ellipse-halo" width="9" height="9" viewBox="0 0 9 9" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle fill="#676A6C" cx="50%" cy="50%" r="4.5"></circle>
      </svg>
    </div>

    <div class="fltops-not-found__description">
      <h2 class="fltops-not-found__title">No Flights on Radar.</h2>
      <h3 class="fltops-not-found__subtitle">
        Page you're looking for does not exist.
      </h3>
    </div>
  </div>
</template>

<style lang="scss">
  .fltops-not-found {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 140px;
    display: flex;
    justify-content: center;
    align-items: center;

    &__art {
      margin-right: 30px;
      position: relative;
      height: 175px;
      width: 175px;

      & > * {
        position: absolute;
      }
    }

    &__title, &__subtitle {
      font-weight: 100;
    }
  }

  $art-size: 175;
  $circle-size: 9;
  $margin: ($art-size - $circle-size) / 2.0;

  // Radar Animations
  #radar-spin {
    $origin: $circle-size / 2;
    will-change: transform;
    animation: 4s linear infinite radarSvgSpin;
    transform-origin: #{$origin}px #{$origin}px;
    top: #{$margin}px;
    left: #{$margin}px;
  }

  #ellipse-halo {
    will-change: transform, opacity;
    animation: 2s ease-out infinite haloSpread;
    transform-origin: center center;
    top: #{$margin}px;
    left: #{$margin}px;
  }

  @keyframes radarSvgSpin {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(90deg);
    }
    50% {
      transform: rotate(180deg);
    }
    75% {
      transform: rotate(270deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes haloSpread {
    0% {
      transform: scale(1);
      opacity: .8;
    }
    85% {
      transform: scale(19.44);
      opacity: 0.01;
    }
    100% {
      transform: scale(19.44);
      opacity: 0.01;
    }
  }
</style>
