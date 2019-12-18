import $ from 'jquery';
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { find, isEmpty, range, sortBy } from 'lodash';

const TO_TOP = 0;
const TO_BOTTOM = 1;

/**
 * TODO: remove when https://github.com/ElemeFE/element/pull/11993 will be merged
 */
export default {
  data() {
    return {
      selectedRowRange: [],
      rowSelectionDirection: TO_BOTTOM,
      handleCheckboxLock: false,
    };
  },
  async mounted() {
    await this.$nextTick();

    $(this.$el, '.el-checkbox__original')
      .on('change', async (e) => {
        if (this.handleCheckboxLock) return false;

        const $row = $(e.target)
          .closest('.el-table__row');

        if ($row[0]) {
          const rowIndex = [...$row[0].parentNode.children].indexOf($row[0]);

          await this.$nextTick();
          this.submitRowIndex(rowIndex, !this.isShiftPressed);
        }
      });
  },
  computed: {
    ...mapState('app', ['isShiftPressed']),
  },
  methods: {
    submitRowIndex(index, reset = false) {
      if (reset) {
        this.selectedRowRange = [index];
      } else if (this.selectedRowRange.length) {
        this.rowSelectionDirection = this.selectedRowRange[0] > index ? TO_TOP : TO_BOTTOM;
        this.selectedRowRange = sortBy([this.selectedRowRange[0], index]);
      } else {
        this.selectedRowRange = [index];
      }
    },
    checkboxElByIndex(index) {
      const $checkboxes = $(this.$refs.table.$el)
        .find(`.el-table__row:nth-of-type(${index + 1}) .el-checkbox__original`);

      return $($checkboxes.get(0));
    },
  },
  watch: {
    isShiftPressed(value) {
      if (!value && this.selectedRowRange.length === 2) {
        this.selectedRowRange = [this.selectedRowRange[0]];
      }
    },
    async selectedRowRange(value) {
      if (value.length !== 2) return;

      this.handleCheckboxLock = true;
      const indexRange = range(value[0], value[1]);
      const markerCheckboxIndex = this.rowSelectionDirection === TO_BOTTOM ? value[1] : value[0];
      const toChecked = !this.checkboxElByIndex(markerCheckboxIndex)[0].checked;

      indexRange.forEach((index) => {
        const $checkbox = this.checkboxElByIndex(index);

        if ($checkbox[0].checked && toChecked) {
          $checkbox.trigger('click');
        }

        if (!$checkbox[0].checked && !toChecked) {
          $checkbox.trigger('click');
        }
      });

      await this.$nextTick();
      this.handleCheckboxLock = false;
    },
  },
};

