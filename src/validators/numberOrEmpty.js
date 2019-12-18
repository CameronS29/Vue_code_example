import isFinite from 'lodash/isFinite';
import { withParams } from 'vuelidate/lib/validators/common';

const falsyTypes = new Set(['', null, undefined]);

export default withParams(
  { type: 'numberOrEmpty' },
  value => (
    isFinite(parseInt(value, 10))
    || falsyTypes.has(value)
  ),
);

export const isPositive = withParams(
  { type: 'numberOrEmpty', isPositive: true },
  value => (
    parseInt(value, 10) > 0
    || falsyTypes.has(value)
  ),
);
