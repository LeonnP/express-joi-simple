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
var Joi = require('joi');
var validationFields = ['params', 'body', 'query', 'headers'];
/**
 * Json body validation middleware
 */
function validate(schema, options) {
    if (options === void 0) { options = {}; }
    options = options || {};
    return function validateRequest(req, res, next) {
        if (req === 'schemaBypass') {
            return schema;
        }
        if (!schema) {
            return next();
        }
        var toValidate = validationFields.reduce(function (newArr, key) {
            var _a, _b;
            if (!schema[key]) {
                return newArr;
            }
            if (key === 'headers') {
                var authorization = req.headers.authorization;
                return __assign({}, newArr, (_a = {}, _a[key] = { authorization: authorization }, _a));
            }
            return __assign({}, newArr, (_b = {}, _b[key] = req[key], _b));
        }, __assign({}, validate));
        var error = Joi.validate(toValidate, schema, options).error;
        // for isValidate()
        res.locals.isValidated = true;
        if (error) {
            // return error response
            return next({ message: error.message, details: error.details });
        }
        // continue
        return next();
    };
}
exports.validate = validate;
//# sourceMappingURL=index.js.map