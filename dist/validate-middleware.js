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
var Joi = require("joi");
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
            var _a, _b, _c;
            if (!schema[key]) {
                return newArr;
            }
            if (key === 'headers') {
                var headersToValidate = {};
                for (var property in schema.headers) {
                    // schema contains property?
                    if (schema.headers.hasOwnProperty(property)) {
                        var propertyToLower = property.toLowerCase();
                        // headers contain property (case insensitive)
                        // this works because node makes all headers lower case
                        if (req.headers.hasOwnProperty(propertyToLower)) {
                            // add property from headers to validation object
                            headersToValidate = __assign({}, headersToValidate, (_a = {}, _a[property] = req.headers[propertyToLower], _a));
                        }
                    }
                }
                return __assign({}, newArr, (_b = {}, _b[key] = headersToValidate, _b));
            }
            return __assign({}, newArr, (_c = {}, _c[key] = req[key], _c));
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
/**
 * Check if validation was executed on response object
 */
function isValidate(res) {
    if (res == null || res.locals == null)
        return false;
    return res.locals.isValidated === true;
}
exports.isValidate = isValidate;
//# sourceMappingURL=validate-middleware.js.map