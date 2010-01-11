/**
 * queries.js 
 * Logic for doing http requests to a remote host and measuring response times
 *
 * Questions:
 * - Good idea to create new http clients all the time? Probably not, will probably
 *   run out of sockets faster than we really want. client pool?
 */
 
var sys     = require('sys'),
    http    = require('http'),
    dbg     = require('./debug'),
    jobs    = require('./jobs');

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
    this.server  = http.createClient(options.host.port || 80, options.host.domain);
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
    
    /**
     * Timeout mechanics for the request
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

/**
 * Creates an http client for running requests against a host.
 *
 * @options is a hash of options for the get request,
 *
 *   options.host.domain         The URL root (eg www.example.com) to issue GET 
 *                               requests to.
 *   options.host.httpHost       The host to send as a header in each request
 *   options.host.port           The port to request one. Defaults to 80.
 *   options.urls                A list of URLs to GET, in sequence.
 *   options.client.useTimer     If true, the requests will be portioned out
 *                               at a fixed interval. Defaults to 100 ms.
 *   options.client.delay        The request delay interval if using the timer
 *   options.client.concurrency  If not using a timer, the requests will be 
 *                               pushed through at a limited concurrency.
 *                               Defaults to concurrency level 10. 
 */
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
            
            var requestRunner = function (callback) {
                var request = new exports.StatisticsRequest(options);

                request.addCallback(callback);
                request.addErrback(callback);

                request.addCallback(successBack);
                if (errBack != undefined) {
                    request.addErrback(errBack);
                }
        
                request.doGet(options.urls[ptr]);
                ptr = (ptr + 1) % length;
            };
            
            var conc = 0;
            
            // You can configure if to use a timer or a request queue
            // to limit connections. If you use a timer, the obvious downside
            // is that you can get request overflow, something that can 
            // be avoided with a queue. A timining queue would probably be
            // the best bet, but I haven't gotten around to implement this yet.
            if (options.client.useTimer != undefined 
                && options.client.useTimer == true) {
                timerId = setInterval(function() { requestRunner(pusher); }, 
                                      options.client.delay || 100);        
            } else {
                jobs.schedule(function(job) {
                    requestRunner(function(r) {
                        pusher(r);
                        job.done();
                    })
                }, options.client.concurrency || 10);
            }
                    
        },
        stop: function() {
            cancelInterval(timerId);
        }
    }
}
