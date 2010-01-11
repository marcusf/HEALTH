HEALTH
======
Experiment with node. Something like a http controlled ab, but mostly an experiment.

The long term goal is to get a distributed http load tester. Right now, stuff that works
are the clients, which can get and measure on URLs. No central control over hosts exist
right now.

Usage
-----

To start the client, do

    node health-worker.js 

See `config.js` for configuration options.

Controlling health-worker
#########################

    $ curl -T config.js http://localhost:4080/tests/12345 
    OK
    $ curl -d "action=start" http://localhost:4080/tests/12345
    <shitloads of json>
