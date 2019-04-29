const fs = require('fs');
const j2s = require('joi-to-swagger');

export class Swagger {

    definitions: any = {};
    currentRoute: any = [];
    paths: any = {};
    swaggerFilePath: any;

    constructor(swaggerFilePath = 'swagger.json') {

        this.swaggerFilePath = swaggerFilePath;
    }

    createJsonDoc(info: any, host: any, basePath: any, swaggerInitialData: any = null, responses: any = []) {

        let swaggerData = swaggerInitialData;

        if (swaggerData == null) {

            swaggerData = defaultInitialData;
        }

        if (info) {
            swaggerData = {
                ...swaggerData,
                info
            }
        }

        if (host) {
            swaggerData = {
                ...swaggerData,
                host
            }
        }

        if (basePath) {
            swaggerData = {
                ...swaggerData,
                basePath
            }
        }

        // add responses definitions
        if (responses) {

            responses.forEach((response: any) => {

                const toSwagger = j2s(response.schema).swagger;

                this.definitions = {
                    ...this.definitions,
                    [response.ref]: toSwagger
                };
            });
        }

        return fs.writeFileSync(this.swaggerFilePath, JSON.stringify(swaggerData));
    }

    addNewRoute(joiDefinistions: any, path: any, method: any) {

        if (this.currentRoute.includes(path + method)) {

            return false;
        }

        this.currentRoute.push(path + method);

        const swaggerData = fs.readFileSync(this.swaggerFilePath, 'utf-8');
        const otherData = JSON.parse(swaggerData);
        const name = joiDefinistions.model;
        const tag = joiDefinistions.group || 'default';
        const summary = joiDefinistions.description || 'No desc';

        const toSwagger = j2s(joiDefinistions).swagger;

        const bodyParams = ['body', 'params', 'query', 'headers', 'responses'];

        if (toSwagger && toSwagger.properties) {

            bodyParams.forEach(param => {

                if (toSwagger.properties[param] != null && toSwagger.properties[param].properties != null) {

                    for (let key in toSwagger.properties[param].properties) {

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

        if (toSwagger && toSwagger.properties && toSwagger.properties.body && name) {

            this.definitions = {
                ...this.definitions,
                [name]: toSwagger.properties.body
            }
        }

        const pathArray = path.split('/').filter(Boolean);
        const transformPath = pathArray.map((path: any) => {
            if (path.charAt(0) === ':') {
                return `/{${path.substr(1)}}`;
            }

            return `/${path}`;
        })
            .join('');

        const parameters = [];

        let {body, params, query, headers, responses} = joiDefinistions;

        if (body) {

            let newParams = {
                "in": "body",
                "name": "body"
            };

            let pushedParam = {};

            if (name != null) {

                pushedParam = {
                    ...newParams,
                    schema: {
                        "$ref": `#/definitions/${name}`
                    }
                }
            } else {
                pushedParam = {
                    ...newParams,
                    ...toSwagger.properties.body
                }
            }

            parameters.push(pushedParam)
        }

        if (params) {
            const getParams = [];
            const rxp = /{([^}]+)}/g;
            let curMatch;

            while (curMatch = rxp.exec(transformPath)) {
                getParams.push(curMatch[1]);
            }

            getParams.forEach((param) => {
                parameters.push({
                    "name": param,
                    "in": "path",
                    ...toSwagger.properties.params.properties[param]
                })
            })

        }

        if (query) {
            const keys = Object.keys(toSwagger.properties.query.properties).map((key) => key);

            keys.forEach((key) => {

                parameters.push({
                    "in": "query",
                    "name": key,
                    ...toSwagger.properties.query.properties[key]
                })
            })
        }

        if (headers) {
            const keys = Object.keys(toSwagger.properties.headers.properties).map((key) => key);
            keys.forEach((key) => {
                parameters.push({
                    "in": "header",
                    "name": key,
                    ...toSwagger.properties.headers.properties[key]
                })
            })
        }

        let responses_final = {};

        if (responses) {

            let responseCodes: any = Object.keys(responses).map((key) => key);

            responseCodes.forEach((code: any) => {

                let schemaObj: any = {};

                if (responses[code].schema) {
                    schemaObj = {
                        schema: {
                            "$ref": `#/definitions/${responses[code].schema}`
                        }
                    };

                }

                responses_final = {
                    ...responses_final,
                    [code]: {
                        description: responses[code].description,
                        ...schemaObj
                    }
                }
            });

        } else {

            // must be here or swagger will be buggy
            responses_final = {
                200: {
                    description: "Success"
                }
            }
        }

        if (this.paths && this.paths[transformPath]) {
            this.paths[transformPath] = {
                ...this.paths[transformPath],
                [method]: {
                    "tags": [
                        tag
                    ],
                    summary,
                    responses: responses_final,
                    parameters,
                }
            }
        } else {
            this.paths = {
                ...this.paths,
                [transformPath]: {
                    [method]: {
                        "tags": [
                            tag
                        ],
                        summary,
                        responses: responses_final,
                        parameters,
                    }
                }
            }
        }

        const newData = {
            ...otherData,
            definitions: this.definitions,
            paths: this.paths
        };

        return fs.writeFileSync(this.swaggerFilePath, JSON.stringify(newData));
    }
}

const defaultInitialData = {
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
