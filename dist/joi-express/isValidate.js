"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isValidate(res) {
    if (res == null || res.locals == null)
        return false;
    return res.locals.isValidated === true;
}
exports.isValidate = isValidate;
//# sourceMappingURL=isValidate.js.map