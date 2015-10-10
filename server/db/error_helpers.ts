import _ = require('lodash');

export function errorToJson(err: any): any {
    return _.mapValues(err.errors, (val) => val.properties.message);
}
