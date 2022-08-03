import _ from 'lodash'
// https://stackoverflow.com/questions/39085399/lodash-remove-items-recursively
export function deepOmit (obj: Record<string, object>, keysToOmit: string | string[]) {
  const keysToOmitIndex = _.keyBy(Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit]) // create an index object of the keys that should be omitted

  function omitFromObject (obj) { // the inner function which will be called recursivley
    return _.transform(obj, function (result, value, key) { // transform to a new object
      if (key in keysToOmitIndex) { // if the key is in the index skip it
        return
      }

      result[key] = _.isObject(value) ? omitFromObject(value) : value // if the key is an object run it through the inner function - omitFromObject
    })
  }

  return omitFromObject(obj) // return the inner function result
}
