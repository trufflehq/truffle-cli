"use strict"
/**
 *
 * MIT License
 *
 * Copyright (c) 2022 Austin Fay
 * austin@austinfay.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
import * as crypto from 'crypto'
/**
 *
 * This function takes any object and generates a unique hash of it.
 * Order of properties in the object, nested objects, and arrays is irrelevant;
 * e.g. [1, 2, 3, 4] will generate the same hash as [3, 2, 4, 1].
 * If the order of an array is relevant to your use case, stringify it first.
 *
 * @param obj
 * @returns string
 */
export function hashObj (obj) {
  function stringifyObj (_obj) {
    // if the object is an array, loop through the elements and
    // stringify them
    if (Array.isArray(_obj)) {
      // we want to sort the parts so that we get the same result
      // even if the input is unsorted
      const parts = _obj.map(function (item) { return stringifyObj(item) }).sort()
      return parts.join(';')
      // if the object is an object, we want to loop through
      // all of the properties and stringify each of them
    } else if (typeof (_obj) === 'object' && _obj !== null) {
      // we want to sort the parts so that we get the same result
      // even if the input is unsorted
      const parts = Object.keys(_obj).map(function (key) { return "".concat(key, ":").concat(stringifyObj(_obj[key])) }).sort()
      return parts.join(';')
    }
    // if the object is a primitive type, just convert it to a string and return it
    return String(_obj)
  }
  const str = stringifyObj(obj)
  const hash = crypto.createHash('sha1').update(str).digest('hex')
  return hash
}
