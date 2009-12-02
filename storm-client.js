/***
 * HEALTH
 * - Spamma urlar ur en lista
 * - Sätta maxspam
 * - Föra statistik: Request-tid, responskod
 * - Spara statistik i CouchDB
 * - Aggregera statistik
 */
 
 var sys = require('sys'),
     http = require('http');
        
var config = {
    "domain"   : "localhost",
    "httpHost" : "localhost",
    "port"     : 8080,
    "delay"    : 10,
    "urls"     : [ 
        "/",
        "/cmlink"
    ]
};

var currentTime = function() { return new Date().getTime() };
var results = [];

var GET = function(url, cfg) {
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
        response.addListener("complete", function() {
            result.completedAt = currentTime();
            result.totalRequestTime = result.completedAt - result.issuedAt;
            result.bodyRequestTime  = result.completedAt - result.responseAt;
            results.push(result);
        });
    });
}

sys.puts("Initializing request " + i);
GET(config.urls[0], config);
setTimeout(function() {
    sys.puts(JSON.stringify(results));
}, 1000);

/* Begin event loop */
var ptr    = 0,
    length = config.urls.length;

setInterval(
    function() {
        sys.puts("Getting " + config.urls[ptr]);
        GET(config.urls[ptr], config);
        ++ptr %= length;
    }, 
    config.delay || 100);














