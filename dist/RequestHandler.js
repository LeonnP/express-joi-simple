"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function RequestHandler(err, req, res, next) {
    if (err.isBoom) {
        if (!err.data || err.data.length === 0 || !err.data[0].message) {
            return res.status(err.output.statusCode).json(err.output.payload);
        }
        var payload = __assign({}, err.output.payload, { message: err.data[0].message });
        return res.status(err.output.statusCode).json(payload);
    }
}
exports.RequestHandler = RequestHandler;
//# sourceMappingURL=RequestHandler.js.map