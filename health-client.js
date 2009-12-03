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

var engine = new query.driver(cfg);

/* Start up the server */
web.server(function (route) {
    route.get("\/hello", function (req, res) {
        res.sendHeader(200, {'Content-Type': 'text/plain'});
        engine.start();
        res.finish();   
    });
    route.get("\/heyho", function(req, res) {
        res.sendHeader(200, {'Content-Type': 'text/plain'});
        res.sendBody('Hi-Ho!');
        res.finish();
    });
}).listen(4080);
