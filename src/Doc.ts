import {Swagger} from './swagger-json';
import * as SwaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import {regexpToPath} from './helper';

export function Doc(app: any, settings?: any) {

    const {info, host, basePath, documentationPath, initialData, filePath, responses} = settings;

    const swagger = new Swagger(filePath);
    swagger.createJsonDoc(info, host, basePath, initialData, responses);

    const handleStacks = (middlewareStack: any, middleware: any, accPath: any) => {

        middlewareStack.forEach((handler: any) => {

            if (!handler.route) {

                if (handler.handle != null && handler.handle.stack != null) {

                    handleStacks(handler.handle.stack, middleware, regexpToPath(handler.regexp));
                }

                return;
            }

            const {path, stack} = handler.route;
            if (path) {
                stack.forEach((routeMehtod: any) => {
                    if (routeMehtod.name == 'validateRequest') {
                        const joiSchema = routeMehtod.handle('schemaBypass');
                        swagger.addNewRoute(joiSchema, accPath + regexpToPath(middleware.regexp) + path, routeMehtod.method)
                    }
                })
            }
        });
    };

    app._router.stack.forEach((middleware: any) => {

        if (middleware.route) { // routes registered directly on the app
            const {path, stack} = middleware.route;
            if (path) {
                stack.forEach((routeMehtod: any) => {
                    if (routeMehtod.name == 'validateRequest') {
                        const joiSchema = routeMehtod.handle('schemaBypass');
                        swagger.addNewRoute(joiSchema, path, routeMehtod.method)
                    }
                })
            }
        } else if (middleware.name === 'router' && middleware.handle.stack) { // router middleware

            handleStacks(middleware.handle.stack, middleware, '');

            /*
            middleware.handle.stack.forEach((handler: any) => {
                if(!handler.route) {
                    return;
                }

                const { path, stack } = handler.route;
                if (path) {
                    stack.forEach((routeMehtod: any) => {
                        if (routeMehtod.name == 'validateRequest') {
                            const joiSchema = routeMehtod.handle('schemaBypass');
                            swagger.addNewRoute(joiSchema, regexpToPath(middleware.regexp) + path, routeMehtod.method)
                        }
                    })
                }
            });
             */
        }
    });

    const swaggerDocument = fs.readFileSync(filePath, 'utf8');

    let docPath = documentationPath || '/';

    const cssIdsToHideJoined = swagger.cssToHide.map(cssId => '#model-' + cssId).join(',');

    let cssForHidingModels = '';

    if (cssIdsToHideJoined.length > 0) {

        cssForHidingModels = cssIdsToHideJoined + ' {display: none}';
    }

    app.use(docPath, SwaggerUi.serve, SwaggerUi.setup(JSON.parse(swaggerDocument), {
        customCss: cssForHidingModels
    }));
}
