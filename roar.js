var program = require('commander'),
    logger = require('winston'),
    express = require('express'),
    socket_lib = require('socket.io'),
    fs = require('fs'),
    _ = require('underscore')._,
    winston = require('winston');

logger.cli();

var logger= new (winston.Logger)({
    transports: [
    new (winston.transports.File)({
        filename:'server.log',
        timestamp:true,
        json:false,
        level: "debug"
    })
    ],
    levels: winston.config.syslog.levels
});


program.version(0.1)
    .option('-p, --port [num]', "Set the port.")
    .parse(process.argv);
    
    
var host = "localhost";
if(program.args.length==1) {
    host = program.args[0];
} else if (program.args.length==0) {
    logger.info("Defaulting to localhost.");
} else {
    logger.info("Too many command line arguments.");
}

var port = 8080;

if(program.port) {
    logger.info("Setting port to " + program.port);
    port = program.port;
}

var app = express.createServer();
var io = socket_lib.listen(this.app, {"log level":0});
io.set("log level", 0);
app.listen(port);
app.use("/static", express.static(__dirname + '/../static'));

// Setup the index page.
app.get('/', function(req, res) {
    // this is just going to be a static landing page.
    res.render('app.ejs', {layout:false});
});


