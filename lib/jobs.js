/**
 * jobs.js
 * Limits the amount of concurrent work for a task.
 *
 * Usage:
 * 
 * var sys = require('sys'),
 *     jobs = require('./jobs');
 *
 * var maxConcurrency = 10, concurrency = 0; // For demonstration purposes 
 * jobs.schedule(function(job) {
 *   concurrency += 1;
 *   sys.puts("Concurrency: " + concurrency); 
 *   setTimeout(function() {
 *      concurrency -= 1;
 *      job.done();
 *   }, 1000);
 * }, maxConcurrency);
 */
 
exports.schedule = function(worker, maxJobs) {
    
    var cntJobs = 1, events = new process.EventEmitter();
    
    var job = {
        done: function() { events.emit("done"); }
    }
    
    events.addListener("done", function() {
       cntJobs -= 1;
       while (cntJobs < maxJobs) {
           cntJobs += 1;
           events.emit("start", worker);
       }
    });
    
    events.addListener("start", function(worker) {
        worker.call(this, job);
    });  
    
    // Start it up
    events.emit("done");  
}
