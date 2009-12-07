var sys = require('sys'),
    fn  = require('./fn');

var currentTime  = function() { return new Date().getTime() };

exports.printResults = function(results, startedAt) { 
    
    var avg = 0, max = 0, min = 9999999999999, now = currentTime(),
        cnt = results.length, runtime = (now - startedAt)/1000,
        codes = {}, errors = 0;

    /* Could just as well fold over these one by one, but not 
     * without looping k*n times instead of just n times.
     */
    fn.map(function(res) {
        avg += res.requestTime;
        max  = Math.max(max, res.requestTime);
        min  = Math.min(min, res.requestTime);
        // Status codes and error calculation
        if (codes[res.status] == undefined) { codes[res.status] = 0; }
        codes[res.status]++;
        if (res.status >= 400 && res.status < 600) errors++;
    }, results);

    avg /= cnt;
    
    var throughput = parseInt(1000*cnt/(now-startedAt)),
        errors     = parseInt(10000*errors/cnt)/100,
        memory     = process.memoryUsage(),
        heapTot    = parseInt(100*memory.heapTotal/(1024*1024))/100,
        heapUsed   = parseInt(100*memory.heapUsed/(1024*1024))/100;
    
    sys.puts("\nHEALTH")
    sys.puts("-------------------------");
    sys.puts("Runtime:\t"        + runtime + " s");
    sys.puts("Heap Total:\t"     + heapTot + " mb");
    sys.puts("Heap Used:\t"      + heapUsed + " mb");
    sys.puts("Total requests:\t" + cnt);
    sys.puts("Throughput:\t"     + throughput + " reqs/s");
    sys.puts("Average time:\t"   + parseInt(avg) + " ms");
    sys.puts("Max time:\t"       + max + " ms");
    sys.puts("Min time:\t"       + min + " ms");
    sys.puts("Errors:\t\t"       + errors + "%");
    
    sys.puts("\nResponse code frequency:\t")
    for (code in codes) {
        sys.puts(code + ":\t\t" + codes[code] + " times");
    }
}
