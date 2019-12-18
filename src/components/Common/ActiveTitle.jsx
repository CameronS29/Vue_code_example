let titleHead = {
  value: document.title,
  nextTitle: null,
  prevTitle: null,
};


export default {
  /**
   * Page title replacement component.
   * Creates a new page title in form `prefix separator suffix`.
   */
  props: {
    /**
     * Title prefix.
     * @type String
     */
    prefix: {
      type: String,
      required: true,
    },

    /**
     * Title suffix.
     * @type String
     * @default null
     */
    suffix: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      prevTitle: null,
      nextTitle: null,
    }
  },

  created() {
    this.prevTitle = titleHead;
    titleHead.nextTitle = this;
    titleHead = this;

    this.updateTitle();
  },

  destroyed() {
    const {nextTitle, prevTitle} = this;
    prevTitle.nextTitle = nextTitle;

    if (nextTitle !== null) {
      nextTitle.prevTitle = prevTitle;
    } else {
      document.title = prevTitle.value;
      titleHead = this.prevTitle;
    }
  },

  computed: {
    value() {
      return `${this.prefix}${this.suffix}`;
    },
  },

  methods: {
    updateTitle() {
      if (this.nextTitle === null) {
        document.title = this.value;
      }
    },
  },

  watch: {
    value: 'updateTitle',
  },

  render() {
    return null;
  },
}
