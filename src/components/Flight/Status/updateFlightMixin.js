import { mapState, mapActions } from 'vuex';
import { get } from 'lodash';

export const flightProp = propPath => ({
  get() {
    return get(this.flight, propPath);
  },
  set(value) {
    this.update({
      [propPath]: value,
    });
  },
});


export default {
  computed: mapState('flights', ['flight']),
  methods: mapActions('flights', ['update']),
};
