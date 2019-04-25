"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router_1 = require("./router");
var BodyParser = require("body-parser");
var joi = require("joi");
var Doc_1 = require("../Doc");
var validate_middleware_1 = require("../validate-middleware");
var settings = {
    info: {
        "title": "Title Example",
        "description": "Description API example",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
            "name": "Example team"
        },
        "license": {
            "name": "MIT"
        }
    },
    host: 'localhost:3000',
    basePath: '/',
    documentationPath: '/doc',
    filePath: './uploads/swagger.json'
};
var app = express();
app.use(BodyParser.json());
var schema = {
    body: {
        test1: joi.string().required()
    },
    model: 'Register',
    responses: {
        200: {
            description: "success"
        },
        404: {
            description: "fail"
        }
    },
};
app.post('/register', validate_middleware_1.validate(schema), function (req, res, next) {
    next();
});
app.use('/login', router_1.router);
// test isValidate()
app.use(function (req, res, next) {
    if (validate_middleware_1.isValidate(res)) {
        console.log('This request has been validated!');
        res.json({ ok: 1 });
    }
    next();
});
app.use(function (err, req, res, next) {
    if (validate_middleware_1.isValidate(res)) {
        res.json({ message: 'Validation errors occured: ' + err.details.map(function (err) { return err.message; }).join(', ') });
    }
    else {
        res.json(err);
    }
});
app.listen(3000, function () {
    Doc_1.Doc(app, settings);
});
//# sourceMappingURL=index.js.map