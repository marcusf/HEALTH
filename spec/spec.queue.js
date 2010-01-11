var queue = require('./../lib/queue');

describe("blocking queue", function() {   
   it("should handle multiple insertions over several closures", function() {
       var  q = queue.blocking(), 
            r = queue.blocking();

       q.insert(3).insert(4);
       assertEquals(2, q.length());
       assertEquals(0, r.length());
       r.insert(3).insert(12);
       assertEquals(2, q.length());
       assertEquals(2, r.length());
   });
   
   it("should only be called once for the getter", function() {
       
       var q = queue.blocking();
       
       var hits = 0;
       
       q.get(1, function(i, slice) {
           hits++;
           assertEquals(slice, [2]);
       });
       
       q.add(1).add(2).add(3);
       
       assertEquals(1, hits);
       
   });
 
});
