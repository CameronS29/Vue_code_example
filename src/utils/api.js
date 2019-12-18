import {forEach, keys, words, capitalize} from 'lodash';
export const response = promise => promise.then(({ data }) => data);

export function getErrorMessage(response) {
  const { data } = response;
  return keys(data).map(field => {
    const fieldStr = words(field).map(w=>capitalize(w)).join(' ');
    const valueStr = data[field].join(" ");
    return `<strong>${fieldStr}:</strong> ${valueStr}`;
  }).join('<br>');
}
