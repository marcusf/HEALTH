/***
 * HEALTH
 * - Spamma urlar ur en lista
 * - Sätta maxspam
 * - Föra statistik: Request-tid, responskod
 * - Spara statistik i CouchDB
 * - Aggregera statistik
 */
 
 var sys    = require('sys'),
     http   = require('http'),
     config = require('./config');
     
var results      = [];
var currentTime  = function() { return new Date().getTime() };

var printResults = function() { 
    
    var avg = 0, max = 0, min = 9999999999999, 
        cnt = results.length, runtime = (currentTime() - startedAt)/1000;
    
    for (i = 0; i < cnt; i++) {
        var res = results[i];
        avg += res.requestTime;
        max  = Math.max(max, res.requestTime);
        min  = Math.min(min, res.requestTime);
    }
    
    avg /= cnt;
    
    var throughput = parseInt(1000.0/avg);
    
    sys.puts("-------------------------");
    sys.puts("Runtime:\t"        + runtime + " s");
    sys.puts("Total requests:\t" + cnt);
    sys.puts("Throughput:\t"     + throughput + " reqs/s");
    sys.puts("Average time:\t"   + parseInt(avg) + " ms");
    sys.puts("Max time:\t"       + max + " ms");
    sys.puts("Min time:\t"       + min + " ms");
}

var GET = function(url, cfg, results) {
    if (cfg.domain == undefined) {
        return null;
    }
    var server  = http.createClient(cfg.port || 80, cfg.domain);
    var request = server.get(url, {"host": cfg.httpHost || cfg.domain});
    var result  = {};
    
    result.url      = url;
    result.issuedAt = currentTime();
    
    request.finish(function (response) {
        result.responseAt = currentTime();
        result.status     = response.statusCode;
        response.addListener("complete", 
            function() {
                result.completedAt   = currentTime();
                result.requestTime   = result.completedAt - result.issuedAt;
                result.responseTime  = result.completedAt - result.responseAt;
                results.push(result);
            }
        );
    });
}

/* Validate config */
if (config.host == undefined || config.urls == undefined) {
    sys.debug("You need to at least specify host configuration and an URL list in config.js");
    process.exit(1);
}

/* Debug */
process.addListener("SIGQUIT", printResults);

/* Main event loop */
var ptr       = 0,
    length    = config.urls.length,
    startedAt = currentTime();

setInterval(
    function() {
        GET(config.urls[ptr], config.host, results);
        ptr = (ptr + 1) % length;
    }, 
config.client.delay || 100);














