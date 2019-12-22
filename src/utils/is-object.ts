import isNullOrUndefined from "src/utils/is-null-or-undefined";

export default (value: unknown): value is object =>
  !isNullOrUndefined(value) && !Array.isArray(value) && typeof value === 'object';