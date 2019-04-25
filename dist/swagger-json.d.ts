export declare class Swagger {
    definitions: any;
    currentRoute: any;
    paths: any;
    swaggerFilePath: any;
    constructor(swaggerFilePath?: string);
    createJsonDoc(info: any, host: any, basePath: any, swaggerInitialData?: any): any;
    addNewRoute(joiDefinistions: any, path: any, method: any): any;
}
