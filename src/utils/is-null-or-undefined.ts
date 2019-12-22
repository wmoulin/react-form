import isUndefined from 'src/utils/is-undefined';

export default (value: unknown): boolean =>
  value === null || isUndefined(value);