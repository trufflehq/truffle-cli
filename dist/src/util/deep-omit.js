import _ from 'lodash';
// https://stackoverflow.com/questions/39085399/lodash-remove-items-recursively
export function deepOmit(obj, keysToOmit) {
    const keysToOmitIndex = _.keyBy(Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit]); // create an index object of the keys that should be omitted
    function omitFromObject(obj) {
        return _.transform(obj, function (result, value, key) {
            if (key in keysToOmitIndex) { // if the key is in the index skip it
                return;
            }
            result[key] = _.isObject(value) ? omitFromObject(value) : value; // if the key is an object run it through the inner function - omitFromObject
        });
    }
    return omitFromObject(obj); // return the inner function result
}
//# sourceMappingURL=deep-omit.js.map