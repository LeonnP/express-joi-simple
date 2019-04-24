export function isValidate(res: any) {

    console.log(res.locals)
    if(res == null || res.locals == null) return false;

    return res.locals.isValidated === true;
}
