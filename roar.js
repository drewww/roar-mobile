var program = require('commander'),
    logger = require('winston'),
    express = require('express'),
    socket_lib = require('socket.io'),
    fs = require('fs'),
    _ = require('underscore')._,
    winston = require('winston'),
    server_model = require('./lib/server-model.js');

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


// okay, so how do we handle voting on things? 
// 1. chat messages
// 2. (anything in the main stream)
//
// a. polls are separate

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

generatePulse();
// setup the state management code

// hash of sectionName -> ServerEventsCollection.
var sectionItems = new model.SectionEventCollection();

var roomPopulations = {};

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
                
                var newChat = new server_model.ServerItem({type:"chat",
                name:userName, timestamp:new Date().getTime(),
                message:data["message"],
                avatarUrl:"/static/img/users/mark.jpeg"});
                
                // var newChat = new server_model.ServerChat();
                
                io.sockets.in("room:" + roomName).emit("section",
                    newChat.toJSON());
                
                sectionItems.add(newChat);
                
                logger.info("(" + roomName + ", " + newChat.id +") " + newChat.get("name") + ": " + newChat.get("message"));                
                
            });
        });
    });
    
    socket.on("join", function(data) {
        socket.get("identity", function(err, userName) {
            socket.get("room", function(err, currentRoom) {
            
            console.log("currentRoom: " + currentRoom);
            if(!_.isNull(currentRoom) && !_.isUndefined(currentRoom) && currentRoom!="null") {
                // if it's valid, then leave it.
                leaveRoom(currentRoom, socket);
            }
            
            // join the socket to the room.
            socket.join("room:" + data["room"]);
            socket.set("room", data["room"]);
            logger.info(userName + " joining " + data["room"]);
            
            socket.emit("join-ok", {"room":data["room"]});
            
            if(_.isUndefined(roomPopulations[data["room"]])) {
                console.log("(" + data["room"] + ") " + "section has never been joined before!")
                
                roomPopulations[data["room"]] = 1;
                io.sockets.in("room:" + data["room"]).emit("population", {"population":roomPopulations[data["room"]]});
            } else {
                roomPopulations[data["room"]] = roomPopulations[data["room"]]+1;
                io.sockets.in("room:" + data["room"]).emit("population", {"population":roomPopulations[data["room"]]});
            }
            
            
            logger.info("pops: " + JSON.stringify(roomPopulations));
            
            io.sockets.in("room:" + data["room"]).emit("section", {"type":"chat", "admin":true, "message":userName + " has joined the section."});
            
            
            });
        });
    });
    
    socket.on("leave", function(data) {
        socket.get("identity", function(err, userName) {
            leaveRoom(data["room"], socket);
        });
    });
    
    socket.on("vote", function(data) {
        socket.get("identity", function(err, userName) {
            var sectionEvent = sectionItems.get(data["id"]);
            
            sectionEvent.addVote();
            
            io.sockets.emit("vote", {id:data["id"]});
            logger.info("voting on " + data["id"] + " now " + sectionEvent.get("votes"));
        });
    });
    
    socket.on("poll-vote", function(data) {
        socket.get("identity", function(err, userName) {
            socket.get("room", function(err, roomName) {
                var poll = sectionItems.get(data["pollId"]);
                poll.addVote(roomName, "/static/img/users/default.png", data["index"]);
            });
        });
    });
    
    socket.on("disconnect", function(data) {
        socket.get("identity", function(err, userName) {
            socket.get("room", function(err, roomName) {
                // pull them out of their room.
                leaveRoom(roomName, socket);
                
            });
        });
    });
});

// periodically publish pulse data.

var baseItems = [
{"type":"chat", "message":"This is a really sweet trending chat message",
"avatarUrl":"/static/img/users/mark.jpeg", "name":"marfay",
"timestamp":new Date().getTime(), "votes":18},
{"type":"sign", "url":"/static/img/users/mark.jpeg",
"avatarUrl":"/static/img/users/mark.jpeg", "name":"drewwww",
"timestamp":new Date().getTime(), "votes":423},
{"type":"word", "word":"Jeter",
"avatarUrl":"/static/img/users/drew.jpeg", "name":"drewwww",
"timestamp":new Date().getTime(), "votes":38}];


function leaveRoom(roomName, socket) {
    
    socket.leave("room:" + roomName);
    
    logger.info("pop pre: " + JSON.stringify(roomPopulations));
    roomPopulations[roomName] = roomPopulations[roomName]-1;
    logger.info("pop post: " + JSON.stringify(roomPopulations));
    logger.info("roomPop: " + roomPopulations[roomName]);

    io.sockets.in("room:" + roomName).emit("population", {"population":roomPopulations[roomName]});
    
    socket.get("identity", function(err, userName) {
        logger.info(userName + " leaving " + roomName);
        io.sockets.in("room:" + roomName).emit("section", {"type":"chat", "admin":true, "message":userName + " has left the section."});
    });
}

function joinRoom(roomName, socket) {
    
}

function generatePulse() {
    
    // auto cycle
    setTimeout(generatePulse, 10000);

    logger.info("PULSING");
    io.sockets.emit("pulse", {items:baseItems});
}

function publishPoll() {
    
}





