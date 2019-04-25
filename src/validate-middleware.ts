const Joi = require('@hapi/joi');

const validationFields = ['params', 'body', 'query', 'headers'];

/**
 * Json body validation middleware
 */
export function validate(schema: any, options: any = {}) {
    options = options || {};

    return function validateRequest(req: any, res: any, next: any) {

        if(req === 'schemaBypass') {
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
                const { authorization } = req.headers;
                return {
                    ...newArr,
                    [key]: { authorization }
                }
            }

            return {
                ...newArr,
                [key]: req[key]
            }
        }, {
            ...validate
        });

        const {error} =  Joi.validate(toValidate, schema, options);

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

    if(res == null || res.locals == null) return false;

    return res.locals.isValidated === true;
}
