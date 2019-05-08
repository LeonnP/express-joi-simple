"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var validate_middleware_1 = require("../validate-middleware");
var joi = require("joi");
exports.router = express_1.Router();
var schema = {
    body: {
        test1: joi.string().required()
    },
    model: 'Login',
    visible: false
};
exports.router.post('/test', validate_middleware_1.validate(schema), function (req, res) {
    res.json({ message: 'test' });
});
//# sourceMappingURL=router.js.map