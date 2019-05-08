import * as Joi from 'joi';

const validationFields = ['params', 'body', 'query', 'headers'];

/**
 * Json body validation middleware
 */
export function validate(schema: any, options: any = {}) {
    options = options || {};

    return function validateRequest(req: any, res: any, next: any) {

        if (req === 'schemaBypass') {
            return schema;
        }

        if (!schema) {
            return next();
        }

        const toValidate = validationFields.reduce((newArr, key) => {
            if (!schema[key]) {
                return newArr;
            }

            if (key === 'headers') {

                let headersToValidate = {};

                for (let property in schema.headers) {

                    // schema contains property?
                    if (schema.headers.hasOwnProperty(property)) {

                        const propertyToLower = property.toLowerCase();

                        // headers contain property (case insensitive)
                        // this works because node makes all headers lower case
                        if (req.headers.hasOwnProperty(propertyToLower)) {

                            // add property from headers to validation object
                            headersToValidate = {
                                ...headersToValidate,
                                // property - original schema property
                                // value - property from headers
                                [property]: req.headers[propertyToLower]
                            }
                        }
                    }
                }

                return {
                    ...newArr,
                    [key]: headersToValidate
                }
            }

            return {
                ...newArr,
                [key]: req[key]
            }
        }, {
            ...validate
        });

        const {error} = Joi.validate(toValidate, schema, options);

        // for isValidate()
        res.locals.isValidated = true;

        if (error) {

            // return error response
            return next({message: error.message, details: error.details});
        }

        // continue
        return next();
    }
}

/**
 * Check if validation was executed on response object
 */
export function isValidate(res: any) {

    if (res == null || res.locals == null) return false;

    return res.locals.isValidated === true;
}
