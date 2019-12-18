import moment from 'moment';

export const defaultFormat = 'Y-MM-DD HH:mm';

export function formatDate(value, parseFormat = undefined) {
  return moment(value, parseFormat).format(defaultFormat);
}
