"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const index_ts_1 = require("src/index.ts");
function App() {
    return (react_1.default.createElement("div", { className: "App" },
        react_1.default.createElement("header", { className: "App-header" }),
        react_1.default.createElement("body", null,
            react_1.default.createElement(index_ts_1.Form, null))));
}
exports.default = App;
//# sourceMappingURL=app.js.map