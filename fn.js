/* fn.js
 * Some simple functional constructs for node.
 */

/** a -> a */
exports.id  = function(a) {
    return a;
}

/** (a -> b) -> [a] -> [b] */
exports.map = function(fn, arr) {
    if (arr == undefined) return undefined;
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        result.push(fn.call(this, arr[i]));
    }
    return result;
}

/** (a -> Bool) -> [a] -> [a] */
exports.filter = function(fn, arr) {
    if (arr == undefined) return undefined;
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        if (fn.call(this, arr[i])) result.push(arr[i]);
    }
    return result;
}

/** (a -> b -> a) -> a -> [b] -> a */
exports.foldl = function(fn, zero, arr) {
    if (arr == undefined) return undefined;
    var result = zero;
    for (var i = 0; i < arr.length; i++) {
        result = fn.apply(this, [result, arr[i]]);
    }
    return result;
}

/** [Int] -> Int */
exports.sum = function(arr) {
    return exports.foldl(function(a,r){return a+r;}, 0, arr);
}

/** [Int] -> Int */
exports.max = function(arr) {
    return Math.max.apply(this, arr);
}

/** [Int] -> Int */
exports.min = function(arr) {
    return Math.min.apply(this, arr);
}