export function isValidate(res: any) {

    if(res == null || res.locals == null) return false;

    return res.locals.isValidated === true;
}
