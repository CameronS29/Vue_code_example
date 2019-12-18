// @flow
import { identity, transform, isEqual, isObject } from 'lodash/fp';
import { get as _get, set as _set, clone, filter } from 'lodash';

const transformer = transform.convert({ cap: false });

const iteratee = baseObj => (result, value, key) => {
  if (!isEqual(value, baseObj[key])) {
    const valIsObj = isObject(value) && isObject(baseObj[key]);
    result[key] = valIsObj === true ? differenceObject(value, baseObj[key]) : value;
  }
};

export function differenceObject(targetObj, baseObj) {
  return transformer(iteratee(baseObj), null, targetObj);
}

export function downloadURI(uri) {
  document.location.replace(uri);
}

type PropBinding = {
  attr?: string,
  mutation: string,
  action: string,
};

type PropTransform = {
  get?: mixed => mixed,
  set?: mixed => mixed,
};

export const vuexProperty = ({ attr, mutation, action }: PropBinding) =>
  (prop: string, { get = identity, set = identity }: PropTransform = {}) => {
    const fullPath = filter([attr, prop]).join('.');
    return {
      get() {
        const plainValue = _get(this, fullPath);
        return get.call(this, plainValue);
      },

      set(value: mixed) {
        const applicative = action || mutation;
        let outValue = set.call(this, value);

        if (attr !== undefined) {
          outValue = _set(clone(this[attr]), prop, outValue);
        }

        return this[applicative](outValue);
      },
    };
  };
