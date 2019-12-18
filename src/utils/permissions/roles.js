import reduce from 'lodash/reduce';

/**
 * Creates guard checker for user roles list.
 * Permission check is combined with logical 'or'.
 *
 * @param {string[]} roles - Allowed user roles. Role is defined as 'user/is{Role}' getter.
 * @returns {function(Vuex): boolean} - Vuex guard checker.
 */
export const role = (...roles) => store => reduce(
  roles,
  (perm, role) => perm || store.getters[`user/is${role}`],
  false,
);
