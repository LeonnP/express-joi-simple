"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function regexpToPath(thing) {
    if (typeof thing === 'string') {
        return thing.split('/');
    }
    else if (thing.fast_slash) {
        return '';
    }
    else {
        var match = thing.toString()
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '$')
            .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
        return match
            ? match[1].replace(/\\(.)/g, '$1')
            : '<complex:' + thing.toString() + '>';
    }
}
exports.regexpToPath = regexpToPath;
//# sourceMappingURL=helper.js.map