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
 * var jobsId = jobs.schedule(function(job) {
 *   concurrency += 1;
 *   sys.puts("Concurrency: " + concurrency); 
 *   setTimeout(function() {
 *      concurrency -= 1;
 *      job.done();
 *   }, 1000);
 * }, maxConcurrency);
 *
 * setTimeout(function() {
 *   jobs.cancel(jobsId);
 * }, 3000);
 */

exports.schedule = function(worker, maxJobs) {
    
    var cntJobs = 1, canceled = false, events = new process.EventEmitter();
    
    var job = {
        done:   function() { events.emit("done"); }, /** When a single job is finished */
        cancel: function() { events.emit("stop"); }  /** When all of the jobs are finished */
    };
    
    events.addListener("done", function() {
       cntJobs -= 1;
       if (canceled) {
           return;
       }
       while (cntJobs < maxJobs) {
           cntJobs += 1;
           events.emit("start", worker);
       }
    });

    events.addListener("stop", function() {
       canceled = true; 
    });
    
    events.addListener("start", function(worker) {
        worker.call(this, job);
    });  
    
    // Start it up
    events.emit("done");
    return events;
}

exports.cancel = function(jobs) {
    if (jobs == undefined || jobs.emit == undefined) {
        throw("Invalid job queue specified");
    }
    jobs.emit("stop");
}
