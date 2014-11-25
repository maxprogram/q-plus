/*!
 * Q library (c) 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 */

(function (definition) {
    // CommonJS
    if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition(require('q'));
    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);
    // <script>
    } else if (typeof self.Q !== "undefined") {
        self.Q = definition(self.Q);
    } else {
        throw new Error("Environment not recognized.");
    }

})(function(Q) {

var newQ = function(q) {
    var isQ = (q && q.defer && q.reject);
    Q = isQ ? q : Q;

    var fn = Q.makePromise.prototype;

    fn.each = each;
    fn.map = map;
    fn.eachSeries = eachSeries;
    fn.forEach = eachSeries;
    fn.mapSeries = mapSeries;

    return Q;
};

// Reduce function that accepts Arrays & Plain Objects
function reduce(arr, fn, accu) {
    if (typeof arr === 'object' && !Array.isArray(arr)) {
        for (key in arr) {
            accu = fn(accu, arr[key], key);
        }
    } else {
        for(var i = 0; i < arr.length; i++) {
            accu = fn(accu, arr[i]);
        }
    }
    return accu;
}

/**
 * Executes function for each element of an array or object,
 * running all functions or promises in parallel.
 * @promise {(array|object)}
 * @param   {function} fn : The function called per iteration
 *                     @param value : Value of element
 *                     @param key|index : Key if object, index if array
 * @returns {object} Original object
 */
function each(fn) {
    var i = 0;
    return this.then(function(object) {
        return Q.all(reduce(object, function(array, value, key) {
            var fnv = Q.isPromise(value) ? value.then(function(v) {
                return fn(v, key || i++);
            }) : fn(value, key || i++);

            return array.concat(fnv);
        }, []))
        .thenResolve(object);
    });
};

/**
 * Transforms an array or object into a new array using the iterator
 * function, running all functions or promises in parallel.
 * @promise {(array|object)}
 * @param   {function} fn : The function called per iteration
 *                     @param value : Value of element
 *                     @param [key] : Key of element
 * @returns {array} Transformed array
 */
function map(fn) {
    // Allow promise as iterator
    //fn = Q.promised(fn);

    return this.then(function(object) {
        return Q.all(reduce(object, function(array, value, key) {
            var fnv = Q.isPromise(value) ? value.then(function(v) {
                return fn(v, key);
            }) : fn(value, key);

            return array.concat(fnv);
        }, []));
    });
};

/**
 * Executes function for each element of an array or object, running
 * any promises in series only after the last has been completed.
 * @promise {(array|object)}
 * @param   {function} fn : The function called per iteration
 *                     @param value : Value of element
 *                     @param key|index : Key if object, index if array
 * @returns {object} Original object
 */
function eachSeries(fn) {
    var i = 0;
    return this.then(function(object) {
        return reduce(object, function(newPromise, value, key) {
            // Allow value to be a promise
            if (Q.isPromise(value)) return newPromise.then(function() {
                return value;
            }).then(function(v) {
                return fn(v, key || i++);
            });

            return newPromise.then(function() {
                return fn(value, key || i++);;
            });
        }, Q())
        .thenResolve(object)
    });
}

/**
 * Transforms an array or object into a new array using the iterator function,
 * running any promises in series only after the last has been completed.
 * @promise {(array|object)}
 * @param   {function} fn : The function called per iteration
 *                     @param value : Value of element
 *                     @param [key] : Key of element
 * @returns {array} Transformed array
 */
function mapSeries(fn) {
    var newArray = [];
    // Allow iterator return to be a promise
    function push(value, key) {
        value = fn(value, key);
        if (Q.isPromise(value)) return value.then(function(v) {
            newArray.push(v);
        });
        newArray.push(value);
    }

    return this.then(function(object) {
        return reduce(object, function(newPromise, value, key) {
            // Allow value to be a promise
            if (Q.isPromise(value)) return newPromise.then(function() {
                return value;
            }).then(function(v) {
                return push(v, key);
            });

            return newPromise.then(function() {
                return push(value, key)
            });
        }, Q());
    }).thenResolve(newArray);
};

return newQ;

});
