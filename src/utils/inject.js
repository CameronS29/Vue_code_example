import Vue from 'vue';
import VueRouter from 'vue-router';
import { guardRouter } from './permissions';
import './filters';

export const createRouter = (routes, base) => (
  new VueRouter({
    mode: 'history',
    routes,
    base,
  })
);

export const attachComponents = (store, components) => (
  document.querySelectorAll('[data-vue]')
    .forEach(el => new Vue({ el, store, components }))
);

export const createApp = ({
  component: App,
  el,
  store,
  routes = [],
  base = '/',
}) => {
  const appElement = document.querySelector(el);
  if (appElement === null) {
    return null;
  }

  return new Vue({
    store,
    router: guardRouter(createRouter(routes, base), store),
    el: appElement,
    template: '<App />',
    components: { App },
  });
};
