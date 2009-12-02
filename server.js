var sys = require('sys'),
    http = require('http'),
    multipart = require('multipart');

var sendOK = function(res, msg) {
    res.sendHeader(200, {'Content-Type': 'text/plain'});
    res.sendBody(msg);
    res.finish();
}

var sendError = function(res, msg) {
    res.sendHeader(404, {'Content-Type': 'text/plain'});
    res.sendBody(msg);
    res.finish();
}

var urls     = {};
var Transfer = { STARTED: "Started", CHUNK: "In transfer", DONE: "Done" };

http.createServer(
    function (req, res) {        
        /* File upload */
        if (req.method == "PUT") {
            
            var hasName = /^\/(.+)$/.exec(req.uri.path);
            if (!hasName) {
                return null;
            }
            
            var url        = hasName[1];
            var fileBuffer = "";
            urls[url]      = { state: Transfer.STARTED };
            
            res.sendHeader(200, {'Content-Type': 'text/plain'});
            res.sendBody("Trying to accept " + url + "\n");
            sys.puts(url + "\t Upload request");
            
            req.addListener("body", function(chunk) {
               fileBuffer += chunk; 
               urls[url].state = Transfer.CHUNK;
            });
            
            req.addListener("complete", function() {
                urls[url].file = fileBuffer;
                urls[url].state = Transfer.DONE;
                sys.puts(url + "\t Done");
                res.sendBody(url + " accepted\n");
                res.finish();                
            });
            
        } else {
            var hasName = /^\/(.+)$/.exec(req.uri.path);            
            if (hasName) {
                url = hasName[1];
                if (urls[url]) {
                    sendOK(res, urls[url].state == Transfer.DONE ? urls[url].file : urls[url].state);
                } else {
                    sendError(res, "NOT FOUND!");
                }
            } else {
                s = "";
                for (key in urls) {
                    s += key + ": " + urls[key].state + "\n";
                }
                sendOK(res, s);
            }
        }
    }).listen(8000);

sys.puts('Server running at http://127.0.0.1:8000/');