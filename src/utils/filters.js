import Vue from 'vue';
import {DateTime} from 'luxon';

Vue.filter("longDT", dtStr => {
  if (dtStr) {
    return DateTime.fromISO(dtStr, {zone: 'utc'}).toFormat("LL/dd/kkkk T");
  } else {
    return '';
  }
});

Vue.filter("longDTLocal", dtStr => {
  if (dtStr) {
    return DateTime.fromISO(dtStr).toFormat("LL/dd/kkkk T");
  } else {
    return '';
  }
});

Vue.filter("longDTTimezone", dtStr => {
  if (dtStr) {
    return DateTime.fromISO(dtStr, { setZone: true }).toFormat("LL/dd/kkkk T");
  } else {
    return '';
  }
});


Vue.filter("shortDT", dtStr => {
  if (dtStr) {
    return DateTime.fromISO(dtStr, {zone: 'utc'}).toFormat("LLL dd, yyyy HH:mmZ");
  } else {
    return '';
  }
});

Vue.filter('ISODateToUS', (dtStr) => {
  if (dtStr) {
    return DateTime.fromISO(dtStr, { zone: 'utc' }).toFormat('LL/dd/kkkk');
  }

  return '';
});

Vue.filter('timeSimple', dtStr => {
  if (dtStr) {
    return DateTime.fromISO(dtStr)
      .toLocaleString(DateTime.TIME_24_SIMPLE);
  } else {
    return '';
  }
});


Vue.filter('timeSimpleUTC', dtStr => {
  if (dtStr) {
    return DateTime.fromISO(dtStr, { zone: 'utc' })
      .toLocaleString(DateTime.TIME_24_SIMPLE);
  } else {
    return '';
  }
});

Vue.filter('fullName', (pilot) => {
  if (!pilot) return '';

  return `${pilot.first_name} ${pilot.last_name}`;
});

