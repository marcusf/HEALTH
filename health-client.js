/**
 * HEALTH CLIENT
 * put  /tests/id <config>: Configuration
 * post /tests/id state=start/stop: Stops, starts a test.
 * get  /tests/id: Gets the status of the test
 * get  /tests: Gets a list of all active tests
 *
 * TODO:
 * - KÖER FÖR BEGRÄNSNINGAR: Schedula jobb, köa jobb.
 */

var sys   = require('sys'),
    query = require('./lib/queries'),
    web   = require('./lib/web'); 

/* Start up the server */
web.server(function (route) {
    
    var activeTests = {};
    
    /** 
     * PUT /tests/[0-9]+
     * Uploads and validates a configuration as valid JSON following
     * the spec in config.js. If valid config, places it in the job
     * list with the id given in the PUT.
     */
    route.put("\/tests\/([0-9]+)", function (parms, req, res) {

        var id = parms[0];
        
        // Manage upload of configuration file
        var buffer = "";        
        req.addListener("body", function(chunk) {
            buffer += chunk;
        });
        
        // On complete, try validating the map.
        req.addListener("complete", function() {
            var map = {};
            
            try {
                eval("(function(config) {" + buffer + "})(map)");
            } catch (e) {
                web.fail(res, 400, "Bad file format:", e);
            };
            
            activeTests[id] = map;
            sys.puts(JSON.stringify(map));
            res.sendHeader(200, {'Content-Type': 'text/plain'});
            res.sendBody("OK\r\n");
            res.finish();
        })
    });
    
    /**
     * POST /tests/[0-9]+ -d state=start/stop
     * Starts/stops the test with the given id if such a test exits.
     * 
     * If the request is to start testing, the response will be a 200 
     * with an open stream of JSON to the client.
     */
    route.post("^\/tests\/([0-9]+)", function (parms, req, res) {
        var id = parms[0], config = activeTests[id];
        var engine;
        
        if (config == undefined) {
            web.fail(res, 404, "No such test: '" + id + "'");
            return false;   
        }
        
        try {
            engine = query.httpStatistics(config);
            if (engine == null) {
                web.fail(res, 400, "Bad configuration file: '" + id + "'", e);
                return false;
            }
        } catch (e) {
            web.fail(res, 400, "Bad configuration file: '" + id + "'", e);
            return false;         
        }
        
        res.sendHeader(200, {'Content-Type': 'application/json'});
        
        engine.start(
            function (success) {
                if (success.status >= 400 && success.status < 600) {
                    res.sendBody(JSON.stringify({"status": "failure", "info": success}));   
                } else {
                    res.sendBody(JSON.stringify({"status": "success", "info": success}));
                }
            },
            function (failure) {
                res.sendBody(JSON.stringify({"status": "failure", "info": failure}));
            }
        );
    });
    
    /**
     * Lists active tests
     */
    route.get("^\/tests(/)?$", function (parms, req, res) {
        res.sendHeader(200, {'Content-Type': 'application/json'});
        res.sendBody(JSON.stringify({"base": "/tests", "tests": activeTests}));
        res.finish();
    });
    
    /**
     * Simple hello message
     */ 
    route.get("^(\/)?$", function (parms, req, res) {
        res.sendHeader(200, {'Content-Type': 'application/json'});
        res.sendBody(JSON.stringify({ "testUrl": "/tests" }));
        res.sendBody("\r\n");
        res.finish();
    });
    
}).listen(4080);
