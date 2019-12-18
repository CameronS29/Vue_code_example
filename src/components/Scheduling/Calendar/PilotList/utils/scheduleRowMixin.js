export default {
  props: {
    maxLength: Number,
    pilot: Object,
    isPilotView: Boolean,
    activePilotId: Number,
    highlighted: Boolean,
  },

  computed: {
    rowStyle() {
      return { height: `${((this.maxLength || 1) * 21) + 3}px` };
    },
  },
};
