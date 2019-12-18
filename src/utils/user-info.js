import qs from 'query-string';

export default {
  get origin() {
    return window.location.origin;
  },
  get pathname() {
    return window.location.pathname;
  },
  get getParams() {
    return qs.parse(window.location.search);
  },
  get referrer() {
    return document.referrer;
  },
  get previousSites() {
    return history.length;
  },

  get browserName() {
    return navigator.appName;
  },
  get browserEngine() {
    return navigator.product;
  },
  get browserVersion1a() {
    return navigator.appVersion;
  },
  get browserVersion1b() {
    return navigator.userAgent;
  },
  get browserLanguage() {
    return navigator.language;
  },
  get browserOnline() {
    return navigator.onLine;
  },
  get browserPlatform() {
    return navigator.platform;
  },
  get dataCookiesEnabled() {
    return navigator.cookieEnabled;
  },
  get dataCookies1() {
    return document.cookie;
  },
  get dataCookies2() {
    return decodeURIComponent(document.cookie.split(";"));
  },

  get devicePixelRatio() {
    return window.devicePixelRatio;
  },
  get innerWidth() {
    return innerWidth;
  },
  get innerHeight() {
    return innerHeight;
  },
  get bodyOffsetWidth() {
    return document.querySelector('body').offsetWidth;
  },
  get bodyOffsetHeight() {
    return document.querySelector('body').offsetHeight;
  },
  get appOffsetWidth() {
    return document.querySelector('.fltops-app').offsetWidth;
  },
  get appOffsetHeight() {
    return document.querySelector('.fltops-app').offsetHeight;
  },
};
