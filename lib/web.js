/**
 * Very thin dispatcher over the http API.
 *
 * Basic usage: 
 *  
 *  var web = require('./web');
 *
 *  web.server(function (route) {
 *      route.get("^\/([\-a-z])+$", function(parms, req, res) {
 *          res.sendHeader(200, {'Content-Type':'text/plain'});
 *          res.sendBody("Hello " + parms[0]);
 *          res.finish();
 *      });
 *  }).listen(8080);
 *
 */
 
var http  = require('http');

/** 
 * Creates a server given a callback function to establish the routes 
 * for the server.
 *
 * @router  A callback function router(route). Use this to set up routes
 *          supported by the server. The in-parameter, route, is an object
 *          with the following methods:
 *
 *          route.get(url,  callback): A route to @callback for GET's on @url.
 *          route.post(url, callback): As above but for POST
 *          route.put(url,  callback): As above but for PUT
 *          route.head(url, callback): As above but for HEAD
 *          route.del(url,  callback): As above but for DELETE
 */
exports.server = function(router) {

    var table = {"PUT": {}, "GET": {}, "POST": {}, "DELETE": {}, "HEAD": {}};
    
    var addRoute = function(method, url, callback) {
        table[method][url] = { "re": new RegExp(url, ""), "callback": callback };
    };
    
    var routeMapping = {
        get:  function(url, callback) { addRoute("GET",    url, callback); },
        post: function(url, callback) { addRoute("POST",   url, callback); },
        put:  function(url, callback) { addRoute("PUT",    url, callback); },
        head: function(url, callback) { addRoute("HEAD",   url, callback); },
        del:  function(url, callback) { addRoute("DELETE", url, callback); }
    };
    
    // Let the caller initialize routes 
    router(routeMapping);
    
    return {
        /**
         * Start listening on @port.
         */
        listen: function(port) {
            http.createServer(function (req, res) {  
                var urlSpace = table[req.method];
                var hit = false;
                for (url in urlSpace) {
                    if (matches = urlSpace[url].re.exec(req.uri.path)) {
                        hit = true;
                        matches.shift();
                        if (!urlSpace[url].callback.apply(this, [matches, req, res])) {
                            break;
                        }
                    }
                }
                if (!hit) {
                    res.sendHeader(404, {'Content-Type': 'text/plain'});
                    res.sendBody("Resource not found\r\n");
                    res.finish();
                }
            }).listen(port);
        }
    }
}

exports.fail = function(res, statusCode) {
    // Remove res, code from arguments
    res.sendHeader(statusCode, {'Content-Type': 'text/plain'});
    for (var i = 2; i < arguments.length; i++) {
        res.sendBody(arguments[i] + "\r\n");
    }
    res.finish();
}
