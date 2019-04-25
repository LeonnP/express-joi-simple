"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var swagger_json_1 = require("./swagger-json");
var SwaggerUi = require("swagger-ui-express");
var fs = require("fs");
var helper_1 = require("./helper");
function Doc(app, settings) {
    var info = settings.info, host = settings.host, basePath = settings.basePath, documentationPath = settings.documentationPath, initialData = settings.initialData, filePath = settings.filePath;
    var swagger = new swagger_json_1.Swagger(filePath);
    swagger.createJsonDoc(info, host, basePath, initialData);
    app._router.stack.forEach(function (middleware) {
        if (middleware.route) { // routes registered directly on the app
            var _a = middleware.route, path_1 = _a.path, stack = _a.stack;
            if (path_1) {
                stack.forEach(function (routeMehtod) {
                    if (routeMehtod.name == 'validateRequest') {
                        var joiSchema = routeMehtod.handle('schemaBypass');
                        swagger.addNewRoute(joiSchema, path_1, routeMehtod.method);
                    }
                });
            }
        }
        else if (middleware.name === 'router' && middleware.handle.stack) { // router middleware
            middleware.handle.stack.forEach(function (handler) {
                if (!handler.route) {
                    return;
                }
                var _a = handler.route, path = _a.path, stack = _a.stack;
                if (path) {
                    stack.forEach(function (routeMehtod) {
                        if (routeMehtod.name == 'validateRequest') {
                            var joiSchema = routeMehtod.handle('schemaBypass');
                            swagger.addNewRoute(joiSchema, helper_1.regexpToPath(middleware.regexp) + path, routeMehtod.method);
                        }
                    });
                }
            });
        }
    });
    var swaggerDocument = fs.readFileSync('./swagger.json', 'utf8');
    var docPath = documentationPath || '/';
    app.use(docPath, SwaggerUi.serve, SwaggerUi.setup(JSON.parse(swaggerDocument)));
}
exports.Doc = Doc;
//# sourceMappingURL=Doc.js.map