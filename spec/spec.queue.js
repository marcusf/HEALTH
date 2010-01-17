var queue = require('./../lib/queue');

describe("blocking queue", function() {   
   it("should handle multiple insertions over several closures", function() {
       var  q = queue.blocking(), 
            r = queue.blocking();

       q.push(3).push(4);
       assertEqual(2, q.length());
       assertEqual(0, r.length());
       r.push(3).push(12);
       assertEqual(2, q.length());
       assertEqual(2, r.length());
   });
   
   it("should only be called once for the getter", function() {
       
       var q = queue.blocking();
       
       var hits = 0;

       q.get(1, function(i, slice) {
           hits++;
           assertEqual(slice, [2]);
       });
       
       q.push(1).push(2).push(3);
       
       assertEqual(1, hits);
       
   });
 
});
