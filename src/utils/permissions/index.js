import reduce from 'lodash/reduce';

export { guardRouter, checkRoute } from './guards';
export { flag } from './waffle';
export { role } from './roles';

export const or = (...guards) => store => reduce(
  guards,
  (perm, guard) => perm || guard(store),
  false,
);

export const and = (...guards) => store => reduce(
  guards,
  (perm, guard) => perm && guard(store),
  true,
);
