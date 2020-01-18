var assert = require('assert');
import isString from "src/utils/is-string";

describe("isString", () => {
    it("should return true", () => {
        assert.equal(isString("coucou"), true);
    });
});