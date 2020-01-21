import isUndefined from "./is-undefined";

export default (value: unknown): boolean =>
  value === null || isUndefined(value);