var http  = require('http');

exports.server = function(router) {
    
    var table = {"PUT": {}, "GET": {}, "POST": {}, "DELETE": {}};
    var addRoute = function(method, url, callback) {
        table[method][url] = { "re": new RegExp(url, ""), "callback": callback };
    }
    
    var routeMapping = {
        get: function(url, callback) {
            addRoute("GET", url, callback);
        },
        post: function(url, callback) {
            addRoute("POST", url, callback);
        },
        put: function(url, callback) {
            addRoute("PUT", url, callback);
        }
    };
    
    /** Let the caller initialize routes */
    router(routeMapping);
    
    return {
        listen: function(port) {
            http.createServer(function (req, res) {  
                var urlSpace = table[req.method];
                for (url in urlSpace) {
                    if (urlSpace[url].re.test(req.uri.path)) {
                        urlSpace[url].callback.apply(this, [req, res]);
                    }
                }
            }).listen(port);
        }
    }
}