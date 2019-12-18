import { ref, withParams } from 'vuelidate/lib/validators/common';

export default prop => withParams(
    { type: 'notZeroIf', prop },
    function (value, parentVm) {
        return !!ref(prop, this, parentVm)
          ? parseInt(value, 10) || 0 > 0
          : true;
    },
);
