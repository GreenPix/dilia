export function dump(obj: any, i: number = 2): string {
    if (typeof obj === 'string') {
        return obj;
    }
    if (typeof obj === 'number') {
        return '' + obj;
    }
    if (typeof obj === 'function') {
        return 'fn';
    }
    if (i === 0) {
        return 'any';
    }
    if (typeof obj === 'object') {
        let res;
        res = '';
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                res += `${key}: ${dump(obj[key], i - 1)}\n`;
            }
        }
        return res;
    }
}
