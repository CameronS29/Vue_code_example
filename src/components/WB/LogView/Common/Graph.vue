<script>
  import { mapGetters } from 'vuex';
  import { isEmpty } from 'lodash';

  import Card from 'Common/Card.vue';
  import Splash from 'Common/Splash.vue';
  import Takeoff from './Takeoff.vue';

  import calcValuesMixin from '../mixins/calcValuesMixin';


  const RED = 'rgba(223, 1, 81, 1)';
  const GREEN = 'rgba(0,255,0,1)';

  // Dataset indexes
  const ENVELOPE = 0;
  const ZERO_FUEL = 1;

  const COMBINED = 3;

  const RAMP = 0;
  const TAKEOFF = 1;
  const LANDING = 2;

  const TRIM = 4;

  export default {
    mixins: [calcValuesMixin],

    props: {
      showTitle: {
        type: Boolean,
        default: true,
      },
    },

    components: {
      Splash,
      Card,
      Takeoff,
    },

    mounted() {
      this.$watch('log.aircraft_type', this.reRender);
      this.$watch('calculations', this.updateGraph);
      this.$watch('cgLimits', this.redrawEnvelop);

      window.addEventListener('orientationchange', this.reRender);
      this.reRender();
    },

    destroyed() {
      window.removeEventListener('orientationchange', this.reRender);
    },

    computed: {
      ...mapGetters('wb', [
        'trimData',
        'zeroFuelData',
        'selectedAircraftType',
      ]),

      envelopDataset() {
        const data = this.cgLimits.map(point => ({ x: point.cg, y: point.cg_weight }));

        if (data.length) {
          data.push(data[0]);
        }
        return {
          data,
          lineTension: 0,
          label: 'Envelop',
        };
      },

      zeroFuelDataset() {
        return {
          data: this.zeroFuelData.map(point => ({ x: point.cg, y: point.zero_fuel })),
          fill: false,
          label: 'Zero fuel',
          pointRadius: 0,
          lineTension: 0,
          borderColor: 'rgba(255,99,132,1)', // red
          borderWidth: 2,
        };
      },

      takeOffLanding() {
        return {
          name: 'takeoflanding',
          data: [],
          fill: false,
          lineTension: 0,
          borderColor: this.takeOffWeightValid ? GREEN : RED, // green
          borderWidth: 2,
          label: 'Take off & Landing',
        };
      },

      rampWeight() {
        const rampWeight = this.getCalcValue('weights.ramp_weight');
        const rampCG = this.getCalcValue('moments.ramp_cg');

        return {
          data: [{ x: rampCG, y: rampWeight }],
          label: 'Ramp Weight',
          pointRadius: 3,
          borderColor: this.rampWeightValid ? GREEN : RED,
          borderWidth: 2,
        };
      },

      takeOffWeightDataset() {
        const takeoffWeight = this.getCalcValue('weights.takeoff_weight');
        const takeoffCG = this.getCalcValue('moments.takeoff_cg');

        return {
          data: [{ x: takeoffCG, y: takeoffWeight }],
          display: true,
          label: 'Takeoff Weight',
          fill: false,
          pointRadius: 3,
          borderColor: this.takeOffValid ? GREEN : RED,
          borderWidth: 2,
        };
      },

      landingWeightDataset() {
        const landingWeight = this.getCalcValue('weights.landing_weight');
        const landingCG = this.getCalcValue('moments.landing_cg');

        return {
          data: [{ x: landingCG, y: landingWeight }],
          label: 'Landing Weight',
          fill: false,
          pointRadius: 3,
          borderColor: this.landingValid ? GREEN : RED,
          borderWidth: 2,
        };
      },

      combinedLine() {
        return {
          data: [
            { x: this.getCalcValue('moments.ramp_cg'), y: this.getCalcValue('weights.ramp_weight') },
            { x: this.getCalcValue('moments.takeoff_cg'), y: this.getCalcValue('weights.takeoff_weight') },
            { x: this.getCalcValue('moments.landing_cg'), y: this.getCalcValue('weights.landing_weight') },
          ],
          label: 'Weights',
          labels: ['Ramp Weight', 'Takeoff Weight', 'Landing Weight'],
          xLabels: ['Ramp Weight', 'Takeoff Weight', 'Landing Weight'],
          fill: false,
          pointRadius: 3,
          borderColor: (
            this.rampWeightValid && this.takeOffValid && this.landingValid
              ? GREEN
              : RED
          ),
          pointBorderColor: [
            this.rampWeightValid ? GREEN : RED,
            this.takeOffValid ? GREEN : RED,
            this.landingValid ? GREEN : RED,
          ],
          borderWidth: 2,
        };
      },

      trimDataset() {
        return {
          data: (
            this.selectedAircraftType && this.selectedAircraftType.name !== 'BE300'
              ? this.trimData.map(point => ({ x: point.cg, y: point.trim_weight }))
              : []
          ),
          fill: false,
          lineTension: 0,
          pointRadius: 0,
          borderColor: 'rgba(255,99,132,1)',
          label: 'Trim Weight',
          borderWidth: 2,
        };
      },

      chartData() {
        return {
          xLabels: ['Ramp Weight', 'Takeoff Weight', 'Landing Weight'],
          datasets: [
            this.envelopDataset,
            this.zeroFuelDataset,
            this.takeOffLanding,
            this.combinedLine,
            this.trimDataset,
          ],
        };
      },
    },

    methods: {
      createGraph() {
        if (this.chart) {
          this.chart.destroy();
        }

        this.chart = new Chart.Scatter(
          this.$refs.graphCanvas.getContext('2d'),
          {
            type: 'line',
            data: this.chartData,
            options: {
              legend: { display: false },

              scales: {
                xAxes: [{
                  position: 'bottom',
                  scaleLabel: {
                    display: true,
                    labelString: 'Inches Aft of Datum',
                  },
                }],

                yAxes: [{
                  position: 'left',
                  scaleLabel: {
                    display: true,
                    labelString: 'Weight',
                  },
                }],
              },

              tooltips: {
                callbacks: {
                  beforeLabel: tooltipItem => (
                    tooltipItem.datasetIndex === COMBINED ? {
                      [RAMP]: 'Ramp Weight',
                      [TAKEOFF]: 'Takeoff Weight',
                      [LANDING]: 'Landing Weight',
                    }[tooltipItem.index] : undefined
                  ),
                },
              },

              animation: { easing: 'easeInQuad', duration: 500 },
            },
          },
        );
      },

      commitChange(field, value) {
        this.chart.data.datasets[COMBINED].data[field] = value.data[0];
        this.chart.data.datasets[COMBINED].pointBorderColor[field] = value.borderColor;
      },

      redrawEnvelop() {
        this.chart.data.datasets[TRIM].data = this.trimDataset.data;
        this.chart.data.datasets[ENVELOPE].data = this.envelopDataset.data;
        this.chart.data.datasets[ZERO_FUEL].data = this.zeroFuelDataset.data;
        this.chart.update();
      },

      updateGraph() {
        this.commitChange(RAMP, this.rampWeight);
        this.commitChange(TAKEOFF, this.takeOffWeightDataset);
        this.commitChange(LANDING, this.landingWeightDataset);
        this.chart.data.datasets[COMBINED].borderColor = this.combinedLine.borderColor;
        this.chart.update();
      },

      reRender() {
        this.createGraph();

        if (!isEmpty(this.calc)) {
          this.updateGraph();
        }

        if (this.cgLimits[0] !== undefined) {
          this.redrawEnvelop();
        }
      },
    },
  };
</script>

<template>
  <card :title="showTitle ? `Weight and Balance Chart` : undefined">
    <splash :visible="!isLoaded && !log.aircraft" light>
      <div class="wb-chart__empty-aircraft" v-if="!log.aircraft" slot="visible">
        Please select aircraft <br> to see load chart.
      </div>

      <div class="wb-chart" v-loading="!isLoaded && log.aircraft">
        <canvas ref="graphCanvas" width="800" height="800" />
      </div>
    </splash>
    <takeoff v-if="selectedAircraftType" :aircraft-type="selectedAircraftType" />
  </card>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .wb-chart {
    padding-bottom: 10px;
    margin: 0 -10px;

    &__empty-aircraft {
      font-size: 1.1em;
      text-align: center;
      width: 50%;
      padding: 20px;
      border-radius: 4px;
      background: transparentize(white, .2);
      border: 1px solid lighten($dark-gray, 10%);
    }
  }
</style>
