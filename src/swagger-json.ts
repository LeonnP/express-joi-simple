const fs = require('fs');
const j2s = require('joi-to-swagger');

export class Swagger {

    definitions: any = {};
    currentRoute: any = [];
    paths: any = {};

    constructor() {
    }

    createJsonDoc(info: any, host: any, basePath: any, swaggerInitialData: any = null) {

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

        return fs.writeFileSync('swagger.json', JSON.stringify(swaggerData));
    }

    addNewRoute(joiDefinistions: any, path: any, method: any) {

        if (this.currentRoute.includes(path + method)) {

            return false;
        }

        this.currentRoute.push(path + method);

        const swaggerData = fs.readFileSync('swagger.json', 'utf-8');
        const otherData = JSON.parse(swaggerData);
        const name = joiDefinistions.model || Date.now();
        const tag = joiDefinistions.group || 'default';
        const summary = joiDefinistions.description || 'No desc';

        const toSwagger = j2s(joiDefinistions).swagger;
        if (toSwagger && toSwagger.properties && toSwagger.properties.body) {
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

        if (responses == null) {

            responses = {
                200: {
                    description: "success"
                }
            }
        }

        if (body) {
            parameters.push({
                "in": "body",
                "name": "body",
                // ...toSwagger.properties.body
                "schema": {
                    "$ref": `#/definitions/${name}`
                }
            })
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

        if (this.paths && this.paths[transformPath]) {
            this.paths[transformPath] = {
                ...this.paths[transformPath],
                [method]: {
                    "tags": [
                        tag
                    ],
                    summary,
                    responses,
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
                        responses,
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

        return fs.writeFileSync('swagger.json', JSON.stringify(newData));
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
