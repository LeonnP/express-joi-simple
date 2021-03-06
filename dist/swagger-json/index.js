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
var swaggerJson = require('./swagger-json');
var j2s = require('joi-to-swagger');
var Swagger = /** @class */ (function () {
    function Swagger() {
        this.definitions = {};
        this.currentRoute = [];
        this.paths = {};
    }
    Swagger.prototype.createJsonDoc = function (info, host, basePath) {
        var swaggerData = swaggerJson.get;
        if (info) {
            swaggerData = __assign({}, swaggerData, { info: info });
        }
        if (host) {
            swaggerData = __assign({}, swaggerData, { host: host });
        }
        if (basePath) {
            swaggerData = __assign({}, swaggerData, { basePath: basePath });
        }
        return fs.writeFileSync('swagger.json', JSON.stringify(swaggerData));
    };
    Swagger.prototype.addNewRoute = function (joiDefinistions, path, method) {
        var _a, _b, _c, _d;
        if (this.currentRoute.includes(path + method)) {
            return false;
        }
        this.currentRoute.push(path + method);
        var swaggerData = fs.readFileSync('swagger.json', 'utf-8');
        var otherData = JSON.parse(swaggerData);
        var name = joiDefinistions.model || Date.now();
        var tag = joiDefinistions.group || 'default';
        var summary = joiDefinistions.description || 'No desc';
        var toSwagger = j2s(joiDefinistions).swagger;
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
        if (responses == null) {
            responses = {
                200: {
                    description: "success"
                }
            };
        }
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
        if (this.paths && this.paths[transformPath]) {
            this.paths[transformPath] = __assign({}, this.paths[transformPath], (_b = {}, _b[method] = {
                "tags": [
                    tag
                ],
                summary: summary,
                responses: responses,
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
                    responses: responses,
                    parameters: parameters,
                },
                _d), _c));
        }
        var newData = __assign({}, otherData, { definitions: this.definitions, paths: this.paths });
        return fs.writeFileSync('swagger.json', JSON.stringify(newData));
    };
    return Swagger;
}());
exports.Swagger = Swagger;
;
//# sourceMappingURL=index.js.map