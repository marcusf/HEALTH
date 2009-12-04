var sys     = require('sys'),
    http    = require('http'),
    dbg     = require('./debug');
    
exports.driver = function(config) {
    
    /* Lets first validate config */
    if (config.host == undefined || config.urls == undefined) return null;
    
    var id = -1,
        currentTime = function() { return new Date().getTime() },
        GET = function(url, cfg, results) {
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
        };

    //process.addListener("SIGQUIT", function() {dbg.printResults(results, startedAt)});
    return {
        results: [],
        startedAt: 0,
        /* Main event loop */
        start: function() {
            var ptr = 0, length = config.urls.length;
            this.results = [];
            this.startedAt = currentTime();
            var that = this;
            id = setInterval(
                function() {
                    GET(config.urls[ptr], config.host, that.results);
                    ptr = (ptr + 1) % length;
                }, 
            config.client.delay || 100);        
        },
        stop: function() {
            cancelInterval(id);
        }
    }
}
