/**
 * HEALTH CLIENT
 * put  /tests/id <config>: Configuration
 * post /tests/id state=start/stop: Stops, starts a test.
 * get  /tests/id: Gets the status of the test
 * get  /tests: Gets a list of all active tests
 */

var sys   = require('sys'),
    query = require('./lib/queries'),
    web   = require('./lib/web'),
    cfg   = require('./config');

var engine = query.httpStatistics(cfg);

/* Start up the server */
web.server(function (route) {
    route.put("\/tests\/(\d+)", function(parms, req, res) {
        
    });
    
    route.post("\/tests\/(\d+)", function (parms, req, res) {
        res.sendHeader(200, {'Content-Type': 'text/plain'});
        engine.start(
            function (success) {
                if (success.status >= 400 && success.status < 600) {
                    res.sendBody(JSON.stringify(success));   
                } else {
                    res.sendBody(JSON.stringify(success));                    
                }
            },
            function (failure) {
                res.sendBody(JSON.stringify(failure));
            }
        );
        //res.finish();   
    });
    
    route.get("\/tests", function (parms, req, res) {
        res.sendHeader(200, {'Content-Type': 'text/plain'});
        res.sendBody("");
        res.finish();
    });
    
    route.get("\/$", function (parms, req, res) {
        res.sendHeader(200, {'Content-Type': 'application/json'});
        res.sendBody(JSON.stringify({ "start": "/tests" }));
    });
    
}).listen(4080);
