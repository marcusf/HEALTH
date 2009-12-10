var sys = require("sys");

exports.blocking = function() {
    
    var queue = [], events = new process.EventEmitter();
    
    var result = {
        push: function(item) {
            queue.push(item);
            events.emit("AVAIL", queue.length-1);
        },
        get: function(from, callback) {
            if (from < queue.length) {
                callback.call(this, queue.length, queue.slice(from));
            } else {
                var listenFun;
                listenFun = function(idx) {
                    if (idx >= from) {
                        callback.call(this, queue.length, queue.slice(from));
                        events.removeListener("AVAIL", listenFun);
                    }
                }
                events.addListener("AVAIL", listenFun);
            }
        }
    }
    
    return result;
}
