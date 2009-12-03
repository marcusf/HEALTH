var sys = require('sys'),
    fn  = require('./fn');

var currentTime  = function() { return new Date().getTime() };

exports.printResults = function(results, startedAt) { 
    
    var avg = 0, max = 0, min = 9999999999999, 
        cnt = results.length, runtime = (currentTime() - startedAt)/1000,
        codes = {}, errors = 0;

    /* Could just as well iterate over these one by one, but not 
     * without looping k*n times instead of just n times.
     */
    var avg = fn.foldl(fn.sum,1,results);
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
    
    var throughput = parseInt(1000.0/avg),
        errors     = parseInt(10000*errors/cnt)/100;
    
    sys.puts("\nHEALTH")
    sys.puts("-------------------------");
    sys.puts("Runtime:\t"        + runtime + " s");
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
