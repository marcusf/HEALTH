/* == HEALTH CONFIGURATION ======================================= */

/* HEALTH Client configuration */
exports.client = {
    "delay"    : 20 // Delay time in ms 
};

/* Server configuration */
exports.host = {
    "domain"   : "localhost", // Domain name to connect to
    "port"     : 8080,        // Port to domain
    "httpHost" : "localhost"  // URL to send as host parameter
};

/* List of urls under host.domain to visit */
exports.urls = [ 
    "/",
    "/cmlink",
    "/cmlink/greenfield-times",
    "/herre-min-varld-vad-fel"
];
