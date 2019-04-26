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
var fs = require('fs');
var j2s = require('joi-to-swagger');
var Swagger = /** @class */ (function () {
    function Swagger(swaggerFilePath) {
        if (swaggerFilePath === void 0) { swaggerFilePath = 'swagger.json'; }
        this.definitions = {};
        this.currentRoute = [];
        this.paths = {};
        this.swaggerFilePath = swaggerFilePath;
    }
    Swagger.prototype.createJsonDoc = function (info, host, basePath, swaggerInitialData) {
        if (swaggerInitialData === void 0) { swaggerInitialData = null; }
        var swaggerData = swaggerInitialData;
        if (swaggerData == null) {
            swaggerData = defaultInitialData;
        }
        if (info) {
            swaggerData = __assign({}, swaggerData, { info: info });
        }
        if (host) {
            swaggerData = __assign({}, swaggerData, { host: host });
        }
        if (basePath) {
            swaggerData = __assign({}, swaggerData, { basePath: basePath });
        }
        console.log(this.swaggerFilePath);
        return fs.writeFileSync(this.swaggerFilePath, JSON.stringify(swaggerData));
    };
    Swagger.prototype.addNewRoute = function (joiDefinistions, path, method) {
        var _a, _b, _c, _d;
        if (this.currentRoute.includes(path + method)) {
            return false;
        }
        this.currentRoute.push(path + method);
        var swaggerData = fs.readFileSync(this.swaggerFilePath, 'utf-8');
        var otherData = JSON.parse(swaggerData);
        var name = joiDefinistions.model || Date.now();
        var tag = joiDefinistions.group || 'default';
        var summary = joiDefinistions.description || 'No desc';
        var toSwagger = j2s(joiDefinistions).swagger;
        var bodyParams = ['body', 'params', 'query', 'headers', 'responses'];
        if (toSwagger && toSwagger.properties) {
            bodyParams.forEach(function (param) {
                if (toSwagger.properties[param] != null && toSwagger.properties[param].properties != null) {
                    for (var key in toSwagger.properties[param].properties) {
                        if (toSwagger.properties[param].properties.hasOwnProperty(key)) {
                            if (toSwagger.properties[param].properties[key].example != null) {
                                if (toSwagger.properties[param].properties[key].example != null &&
                                    toSwagger.properties[param].properties[key].example.value != null) {
                                    toSwagger.properties[param].properties[key].example = toSwagger.properties[param].properties[key].example.value;
                                }
                            }
                        }
                    }
                }
            });
        }
        if (toSwagger && toSwagger.properties && toSwagger.properties.body) {
            this.definitions = __assign({}, this.definitions, (_a = {}, _a[name] = toSwagger.properties.body, _a));
        }
        var pathArray = path.split('/').filter(Boolean);
        var transformPath = pathArray.map(function (path) {
            if (path.charAt(0) === ':') {
                return "/{" + path.substr(1) + "}";
            }
            return "/" + path;
        })
            .join('');
        var parameters = [];
        var body = joiDefinistions.body, params = joiDefinistions.params, query = joiDefinistions.query, headers = joiDefinistions.headers, responses = joiDefinistions.responses;
        if (body) {
            parameters.push({
                "in": "body",
                "name": "body",
                // ...toSwagger.properties.body
                "schema": {
                    "$ref": "#/definitions/" + name
                }
            });
        }
        if (params) {
            var getParams = [];
            var rxp = /{([^}]+)}/g;
            var curMatch = void 0;
            while (curMatch = rxp.exec(transformPath)) {
                getParams.push(curMatch[1]);
            }
            getParams.forEach(function (param) {
                parameters.push(__assign({ "name": param, "in": "path" }, toSwagger.properties.params.properties[param]));
            });
        }
        if (query) {
            var keys = Object.keys(toSwagger.properties.query.properties).map(function (key) { return key; });
            keys.forEach(function (key) {
                parameters.push(__assign({ "in": "query", "name": key }, toSwagger.properties.query.properties[key]));
            });
        }
        if (headers) {
            var keys = Object.keys(toSwagger.properties.headers.properties).map(function (key) { return key; });
            keys.forEach(function (key) {
                parameters.push(__assign({ "in": "header", "name": key }, toSwagger.properties.headers.properties[key]));
            });
        }
        var responses_final = {};
        if (responses) {
            var keys = Object.keys(toSwagger.properties.responses.properties).map(function (key) { return key; });
            keys.forEach(function (key) {
                responses_final = __assign({}, responses_final, toSwagger.properties.responses.properties[key]);
            });
        }
        else {
            responses_final = {
                200: {
                    description: "Success"
                }
            };
        }
        if (this.paths && this.paths[transformPath]) {
            this.paths[transformPath] = __assign({}, this.paths[transformPath], (_b = {}, _b[method] = {
                "tags": [
                    tag
                ],
                summary: summary,
                responses_final: responses_final,
                parameters: parameters,
            }, _b));
        }
        else {
            this.paths = __assign({}, this.paths, (_c = {}, _c[transformPath] = (_d = {},
                _d[method] = {
                    "tags": [
                        tag
                    ],
                    summary: summary,
                    responses_final: responses_final,
                    parameters: parameters,
                },
                _d), _c));
        }
        var newData = __assign({}, otherData, { definitions: this.definitions, paths: this.paths });
        return fs.writeFileSync(this.swaggerFilePath, JSON.stringify(newData));
    };
    return Swagger;
}());
exports.Swagger = Swagger;
var defaultInitialData = {
    "swagger": "2.0",
    "info": {
        "version": "1.0.0",
        "title": "Swagger Example",
        "description": "A sample API",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
            "name": "Swagger API Team"
        },
        "license": {
            "name": "MIT"
        }
    },
    "paths": {},
    "definitions": {},
    "host": "localhost:3000",
    "basePath": "/",
    "schemes": [
        "http",
        "https"
    ],
    "consumes": [
        "application/json"
    ],
    "produces": [
        "application/json"
    ]
};
//# sourceMappingURL=swagger-json.js.map