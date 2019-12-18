import map from 'lodash/map';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';

import intersection from 'lodash/intersection';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';


const checkEveryOne = flag => (flag.everyone);
const checkSuperUser = (flag, user) => (flag.superusers && user.is_superuser);
const checkStaff = (flag, user) => (flag.staff && user.is_staff);
const checkGroups = (flag, user) => !isEmpty(intersection(flag.groups, user.groups));
const checkUsers = (flag, user) => includes(flag.users, user.id);

const permissionCheckers = [
  checkEveryOne,
  checkSuperUser,
  checkStaff,
  checkGroups,
  checkUsers,
];

/**
 * Checks if {user} is allowed for given Waffle {flag}.
 * @param flag - Waffle flag instance.
 * @param user - current user.
 * @returns {*}
 */
export const checkFlag = (flag, user) => reduce(
  permissionCheckers,
  (perm, checker) => (perm || checker(flag, user)),
  false,
);

/**
 * Creates guard checker from list of waffle flag names.
 * Permission check is combined with logical 'or'.
 *
 * @param {string[]} flags - Waffle flag names.
 * @returns {function(Vuex): boolean} - Vuex permission guard function.
 */
export const flag = (...flags) => (store) => {
  const flagMap = store.getters['user/flags'];
  const user = store.getters['user/user'];

  const flagDefs = filter(map(flags, flg => flagMap[flg]));
  return reduce(flagDefs, (perm, flag) => perm || checkFlag(flag, user), false);
};

