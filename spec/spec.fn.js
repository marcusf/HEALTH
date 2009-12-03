var fn = require('./../fn');

var sq      = function(x) { return x*x; };
var even    = function(x) { return x%2==0; };
var numbers = [1,2,3,4];

describe("map", function() {   
   it("should handle the empty array gracefully", function() {
       assertEqual([], fn.map(fn.id, []));
       assertEqual([], fn.map(sq, []));
       assertEqual(undefined, fn.map(fn.id, undefined));
   });
   
   it("should be idempotent on the input", function() {
       var result = fn.map(sq, numbers);
       assertEqual([1,2,3,4], numbers);
       assertEqual([1,4,9,16], result);
   });
});

describe("filter", function() {
   it("should be idempotent on the input", function() {
       var result = fn.filter(even, numbers);
       assertEqual([1,2,3,4], numbers);
       assertEqual([2,4], result);
   }); 
});

describe("foldl", function() {
    it("should work as you expect a foldl to work", function() {
        var add   = function(r,a) { return r+a; };
        var mul   = function(r,a) { return r*a; };
        var sqmul = function(r,a) { return r*(even(a) ? a : 1); };
        assertEqual(10, fn.foldl(add,   0, numbers));
        assertEqual(24, fn.foldl(mul,   1, numbers));
        assertEqual( 8, fn.foldl(sqmul, 1, numbers));
    });
});

describe("sum", function() {
   it("should sum to 10", function() {
       assertEqual(10, fn.sum(numbers));
   });
});