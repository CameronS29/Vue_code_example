import {greaterOrEqualThanField, lessOrEqualThanField} from "../../../../../validators/date";
import {required, requiredIf} from 'vuelidate/lib/validators';
import LogAPI from '../../../../../api/flightlog';
import {DateTime} from "luxon";

const DATE_FORMAT = "MM/DD/YYYY";
const LUXON_DATE_FORMAT = "MM/dd/yyyy";

const overlap = function (value) {
  if (!value) return true;
  let date = DateTime.fromString(value, LUXON_DATE_FORMAT);
  for (let swap of this.swaps) {
    console.log([value, swap.date_of_install, swap.date_of_removal]);
    if (this.id && this.id === swap.id) {
      continue;
    }
    if (DateTime.fromISO(swap.date_of_install) >= date && date >= DateTime.fromISO(swap.date_of_removal) && swap.date_of_install) {
      return false;
    }
  }
  if (this.lastSwap && this.lastSwap.id === this.id) {
    return true;
  }
  return !(this.lastSwap && !this.lastSwap.date_of_install && DateTime.fromISO(this.lastSwap.date_of_removal) < date);

};

const noLogsBetween = function (value) {
    if (!value) return true;
    if (this.logsBetweenCache[this.removalDate + this.installDate] !== undefined) {
      return this.logsBetweenCache[this.removalDate + this.installDate];
    }
    let dateStart, dateEnd;
    if (this.removalDate) {
      dateStart = DateTime.fromString(this.removalDate, LUXON_DATE_FORMAT, {'zone': 'utc'}).endOf('day').toISO();
    } else {
      dateStart = "";
    }
    if (this.installDate) {
      dateEnd = DateTime.fromString(this.installDate, LUXON_DATE_FORMAT, {'zone': 'utc'}).endOf('day').toISO();
    } else {
      dateEnd = "";
    }
  return new Promise((resolve, reject) => {
    LogAPI.getFilteredLogs({
      aircraft: this.aircraft,
      actual_datetime_out_0: dateStart,
      actual_datetime_out_1: dateEnd,
    }, 1, 1).then(({count}) => {
      this.logsBetweenCache[this.removalDate + this.installDate] = (count === 0);
      resolve(this.logsBetweenCache[this.removalDate + this.installDate]);
    });
  });
};

export default {
  validations() {
    let removalValidation = {
      removalDate: {required, overlap, noLogsBetween}
    };
    let installValidation = {
      ...removalValidation,
      installDate: {
        required,
        noLogsBetween,
        lessThanField: greaterOrEqualThanField("removalDate"),
        overlap
      },
      swapEngine: {required},
      comments: {required},
      selectedLog: {
        requiredIf: requiredIf('notDefaultValue'),
      },
    };
    if (!this.defaultValue) {
      installValidation = {
        ...installValidation,
        selectedLogDate: {
          lessOrEqualThanField(value) {
            if (!this.installDate || !value) {
              return false;
            }
            return DateTime.fromISO(value).diff(
              DateTime.fromString(this.installDate, LUXON_DATE_FORMAT, {zone: 'utc'}).endOf('day'),
              'seconds'
            ).seconds;

          },
        }
      }
    }
    if (this.isRemoval) {
      return removalValidation;
    } else if (this.selectedSwap && this.selectedSwapDate && this.originalSwap.engine != this.swap.engine) {
      return {
        ...installValidation,
        swapDate: {
          greaterOrEqualThanField(value) {
            if (!this.selectedSwapDate || value) {
              return false;
            }
            return DateTime.fromString(value, LUXON_DATE_FORMAT).diff(
              DateTime.fromString(this.selectedSwapDate, LUXON_DATE_FORMAT, {zone: 'utc'}).endOf('day'),
              'seconds'
            ).seconds >= 0;
          },
          lessOrEqualThanField: lessOrEqualThanField("installDate"),
          required
        }
      };
    } else {
      return installValidation;
    }
  },
}
