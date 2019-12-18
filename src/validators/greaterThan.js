import {req, withParams} from 'vuelidate/lib/validators/common';

export default (min) =>
  withParams({type: 'greaterThan', min}, value =>
    !req(value) || (!/\s/.test(value) && min < value))
