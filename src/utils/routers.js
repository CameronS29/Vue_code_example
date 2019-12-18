// @flow
import { isFunction, mapValues, identity, has, omit } from 'lodash';


export function mapProps(props, mergedWith = {}) {
  return (route) => {
    const { params } = route;
    const paramsToMerge = isFunction(mergedWith)
      ? mergedWith(route)
      : mergedWith;

    return {
      ...paramsToMerge,
      ...mapValues(
        props,
        (apply, name) => params[name] && apply(params[name]),
      ),
    };
  };
}


/**
 *
 * @param {String | Function} queryParam: Param name or function of signature () => String.
 * @param {*} defaultValue: Default value if param is not set; if function, will be called with $vm as this.
 * @param {Function} mapper: query value functor, default is a => a.
 * @returns query param getter.
 */
export const queryGetter = (queryParam, defaultValue = '', mapper = identity) => (
  function () {
    const [value, param] = [defaultValue, queryParam]
      .map(f => (isFunction(f) ? f.call(this) : f));

    return has(this.$route.query, param)
      ? mapper.call(this, this.$route.query[param])
      : value;
  });

/**
 *
 * @param {String | Function} queryParam: Param name or function of signature () => String.
 * @param {*} defaultValue: Default value, which is not showed in query string; if function,
 *  will be called with $vm as this.
 * @param {Function} mapper: value functor, default is a => a.
 * @returns route param setter.
 */
export const querySetter = (queryParam, defaultValue = '', mapper = identity) => (
  function (value) {
    const [dValue, param] = [defaultValue, queryParam]
      .map(f => (isFunction(f) ? f.call(this) : f));

    const query = omit(this.$route.query, param);
    const mappedValue = mapper.call(this, value);

    if (mappedValue !== dValue) {
      query[param] = mappedValue;
    }
    this.$router.push({ query });
    return value;
  });

export const queryParam = ({
  param,
  defaultValue = '',
  mapper = identity,
  dump = null,
  load = null,
}) => ({
  get: queryGetter(param, defaultValue, load || mapper),
  set: querySetter(param, defaultValue, dump || mapper),
});
