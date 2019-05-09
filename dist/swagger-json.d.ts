export declare class Swagger {
    definitions: any;
    currentRoute: any;
    paths: any;
    swaggerFilePath: any;
    cssToHide: string[];
    constructor(swaggerFilePath?: string);
    createJsonDoc(info: any, host: any, basePath: any, swaggerInitialData?: any, responses?: any): any;
    addNewRoute(joiDefinistions: any, path: any, method: any): any;
}
