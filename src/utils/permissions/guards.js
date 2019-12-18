import filter from 'lodash/filter';
import map from 'lodash/map';
import reduce from 'lodash/reduce';

const filterBy = (filters, store) => (
  Array.isArray(filters)
    ? reduce(filters, (perm, flt) => perm && flt(store), true)
    : filters(store)
);

/**
 * Checks permissions for {route} instance through all matched path.
 * Permission check through matched hierarchy combined with logical 'and'.
 *
 * @param {Route} route - route instance
 * @param {Vuex} store - store instance.
 * @returns {boolean} is route allowed for current user.
 */
export const checkRoute = (route, store) => {
  const filters = filter(map(route.matched, 'meta.permissions'));
  return reduce(filters, (perm, flt) => perm && filterBy(flt, store), true);
};

/**
 * Creates guard for vue router, based on {meta.permissions}.
 * @param {VueRouter} router - Router instance.
 * @param {Vuex} store - Vuex instance.
 * @returns {VueRouter}
 */
export const guardRouter = (router, store) => {
  router.beforeEach((to, from, next) => {
    if (checkRoute(to, store)) {
      next();
    } else {
      next({ name: 'forbidden', replace: true });
    }
  });

  return router;
};
