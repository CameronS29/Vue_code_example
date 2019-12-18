import { ref, withParams } from 'vuelidate/lib/validators/common';

export default prop => withParams(
  { type: 'trueIf', prop },
  function (value, parentVm) {
    return !!ref(prop, this, parentVm) ? value : true;
  },
);
