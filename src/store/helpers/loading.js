import { merge, flatten, filter } from 'lodash';


export const INC_PROGRESS = 'INC_PROGRESS';
export const DEC_PROGRESS = 'DEC_PROGRESS';

export default (module = {}) => merge(module, {
  state: {
    loading: 0,
  },

  getters: {
    isLoading: state => state.loading > 0,
  },

  mutations: {
    [INC_PROGRESS](state) {
      state.loading += 1;
    },

    [DEC_PROGRESS](state) {
      state.loading -= 1;
    },
  },
});

export const affectLoading = function (target, property, descriptor) {
  const original = descriptor.value;

  descriptor.value = async function (...args) {
    const { commit } = args[0];
    commit(INC_PROGRESS);

    try {
      return await original.apply(this, args);
    } finally {
      commit(DEC_PROGRESS);
    }
  };

  return descriptor;
};

export const affectLoadingNs = name => function (target, property, descriptor) {
  const original = descriptor.value;
  const incMutation = filter(flatten([name, INC_PROGRESS])).join('/');
  const decMutation = filter(flatten([name, DEC_PROGRESS])).join('/');

  descriptor.value = async function (...args) {
    const { commit } = args[0];
    commit(incMutation, undefined, { root: true });

    try {
      return await original.apply(this, args);
    } finally {
      commit(decMutation, undefined, { root: true });
    }
  };

  return descriptor;
};
