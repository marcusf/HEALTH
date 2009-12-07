/* == HEALTH CONFIGURATION ================================================ */

/* HEALTH Client configuration */
config.client = {
    "delay"    : 100,    // Delay time in ms 
    "timeout"  : 15000  // Max request timeout before a request is a failure
};

/* Server configuration */
config.host = {
    "domain"   : "localhost", // Domain name to connect to
    "port"     : 8080,        // Port to domain
    "httpHost" : "localhost"  // URL to send as host parameter
};

/* List of urls under host.domain to visit */
config.urls = [ 
    "/",
    "/cmlink",
    "/cmlink/greenfield-times",
    "/herre-min-varld-vad-fel"
];
