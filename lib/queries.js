var sys     = require('sys'),
    http    = require('http'),
    dbg     = require('./debug');

/** Utility functions */
currentTime = function() { return new Date().getTime() };

/** GET request. Simple inline request driver */
exports.StatisticsRequest = function(options) {
    if (options.host.domain == undefined) {
        throw("Must specify a domain name to query");
        return null;
    }
    this.promise = new process.Promise();
    this.options = options;    
    this.server = http.createClient(options.host.port || 80, options.host.domain);    
};

var proto = exports.StatisticsRequest.prototype;

proto.addCallback = function(f) {
    this.promise.addCallback(f);
}

proto.addErrback = function(f) {
    this.promise.addErrback(f);
}

/** Performs the GET request */
proto.doGet = function(url) {
    
    var request = this.server.get(url, { "host": this.options.host.httpHost || 
                                                 this.options.host.domain });
    var result  = { "url": url, "issuedAt": currentTime() };    
    var timeout = this.options.client.timeout || 10000;
    var myself = this;
    
    /* Timeout mechanics for the request
     * Really, one would like to use the .timeout in process.Promise, but it
     * doesn't allow passing parameters to the event, which makes it useless,
     * since we still want to get information on which URL timed out.
     */
    var failedRequest = false;    
    var timeoutId = setTimeout(function() {
        failedRequest = true;
        myself.promise.emitError(result);
    }, timeout);
    
    request.finish(function (response) {
        if (!failedRequest) {
            result.responseAt = currentTime();
            result.status     = response.statusCode;
            response.addListener("complete", 
                function() {
                    clearTimeout(timeoutId);
                    result.completedAt   = currentTime();
                    result.requestTime   = result.completedAt - result.issuedAt;
                    result.responseTime  = result.completedAt - result.responseAt;
                    
                    myself.promise.emitSuccess(result);
                });
        }
    });

}

exports.httpStatistics = function(options) {
    
    /* Lets first validate config */
    if (options.host == undefined || options.urls == undefined) return null;
    
    var timerId = -1,    
    results = [],
    startedAt = -1;

    process.addListener("SIGQUIT", function() {dbg.printResults(results, startedAt)});
    
    return {
        /* Main event loop */
        start: function(successBack, errBack) {
            var ptr = 0, length = options.urls.length;
            results = [];
            startedAt = currentTime();
            
            // A request is a promise, so we have success and error
            // callbacks. Let's rig them up in the init.
            var pusher = function(r) { results.push(r); };
            
            timerId = setInterval(
                function() {
                    var request = new exports.StatisticsRequest(options);

                    request.addCallback(pusher);
                    request.addErrback(pusher);

                    request.addCallback(successBack);
                    if (errBack != undefined) {
                        request.addErrback(errBack);
                    }
            
                    request.doGet(options.urls[ptr]);
                    ptr = (ptr + 1) % length;
                }, 
            options.client.delay || 100);        
        },
        stop: function() {
            cancelInterval(timerId);
        }
    }
}
