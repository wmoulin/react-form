import isNullOrUndefined from "./is-null-or-undefined";

export default (value: unknown): value is object =>
  !isNullOrUndefined(value) && !Array.isArray(value) && typeof value === 'object';