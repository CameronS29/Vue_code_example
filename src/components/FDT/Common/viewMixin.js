import { mapGetters, mapActions } from 'vuex';
import { filter, first } from 'lodash';
import { DateTime } from 'luxon';

export default {
  props: {
    pilotId: { type: Number, required: false },
    month: { type: Number, required: false },
    year: { type: Number, required: false },
  },

  async created() {
    const { year, month } = this;
    const [day, zone] = [1, this.tz];

    this.getAllAvailableAirports();
    await this.$store.dispatch('pilots/getPilots');
    await this.selectPilot(this.pilotId);
    await this.setDate({
      date: DateTime.fromObject({ year, month, day, zone }),
      resetRevision: false,
    });
  },

  computed: {
    ...mapGetters('fdt/calendar', ['tz']),
    ...mapGetters('pilots', ['selectablePilots', 'pilot']),
    ...mapGetters('user', ['user']),
  },

  methods: {
    ...mapActions('fdt/calendar', ['setPilot', 'setDate']),
    ...mapActions('airports', ['getAllAvailableAirports']),

    selectPilot(id = first(filter(this.selectablePilots, 'is_active')).id) {
      if (this.onlyPilot && id !== this.user.pilot) {
        const pilotId = this.user.pilot;
        this.$router.replace({ params: { pilotId } });
      } else {
        this.setPilot(id);
      }
    },
  },

  watch: {
    pilotId: 'selectPilot',
  },
};
