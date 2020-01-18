"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require('assert');
const is_string_1 = require("./is-string");
describe("isString", () => {
    it("should return true", () => {
        assert.equal(is_string_1.default("coucou"), true);
    });
});

