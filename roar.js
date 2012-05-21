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
    new (winston.transports.Console)({
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
var io = socket_lib.listen(app, {"log level":0});
io.set("log level", 0);
app.listen(port);
app.use("/static", express.static(__dirname + '/static'));

// Setup the index page.
app.get('/', function(req, res) {
    // this is just going to be a static landing page.
    res.render('app.ejs', {layout:false, locals:{"host":host, "port":port}});
});

app.get('/test', function(req, res) {
    // this is just going to be a static landing page.
    res.render('test.ejs', {layout:false, locals:{"host":host, "port":port}});
});


io.sockets.on('connection', function(socket) {
    // console.log("connection: " + socket);
    logger.info("Received connection: " + socket.id);
    
    socket.on("identify", function(data) {
        // for a demo, we're going to just trust people's names.
        socket.set("identity", data["name"]);
        socket.emit("identity-ok", {"name":data["name"]});
        logger.info("identifying socket: " + data["name"]);
    });
    
    socket.on("chat", function(data) {
        socket.get("identity", function(err, userName) {
            socket.get("room", function(err, roomName) {
                logger.info("(" + roomName + ") " + userName + ": " + data["message"]);
                
                io.sockets.in("room:" + roomName).emit("chat",
                    {"name":userName, "timestamp":new Date().getTime(),
                    "message":data["message"],
                    "avatarUrl":"/static/img/users/default.png"});
            });
        });
    });
    
    socket.on("join", function(data) {
        socket.get("identity", function(err, userName) {
            socket.get("room", function(err, currentRoom) {
            
            if(!_.isNull(currentRoom) && !_.isUndefined(currentRoom)) {
                // if it's valid, then leave it.
                socket.leave("room:" + currentRoom);
                logger.info(userName + " leaving " + currentRoom);
            }
            
            // join the socket to the room.
            socket.join("room:" + data["room"]);
            socket.set("room", data["room"]);
            
                logger.info(userName + " joining " + data["room"]);
            
            });
        });
    });
    
    socket.on("leave", function(data) {
        socket.get("identity", function(err, userName) {
            socket.leave("room:" + data["room"]);
            
            logger.info(userName + " leaving " + data["room"]);
        });
    });
    
    
    socket.on("disconnect", function(data) {
        socket.get("identity", function(err, userName) {
            
            
            
            
        });
    });
});






