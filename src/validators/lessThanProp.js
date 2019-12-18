import {req, ref, withParams} from 'vuelidate/lib/validators/common';

export default prop => withParams(
  {type: 'lessThanProp', prop},
  function (value, parentVm) {
    let v = ref(prop, this, parentVm);
    return value ? v >= parseInt(value) : true;
  })
