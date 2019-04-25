/**
 * Json body validation middleware
 */
export declare function validate(schema: any, options?: any): (req: any, res: any, next: any) => any;
/**
 * Check if validation was executed on response object
 */
export declare function isValidate(res: any): boolean;
