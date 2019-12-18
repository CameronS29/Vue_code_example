import { fromPairs, invertBy } from 'lodash';

const zoneOffsetList = [
  ['UTC', 'UTC'],
  ['EST', 'UTC-5'],
  ['EDT', 'UTC-4'],
  ['CST', 'UTC-6'],
  ['CDT', 'UTC-5'],
  ['MST', 'UTC-7'],
  ['MDT', 'UTC-6'],
  ['PST', 'UTC-8'],
  ['PDT', 'UTC-7'],
];

const nameMap = fromPairs(zoneOffsetList);
const offsetMap = invertBy(nameMap);

export default zoneOffsetList;

export function fromOffset(offset) {
  return offsetMap[offset];
}

export function fromName(name) {
  return nameMap[name];
}
