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


var nameImages = {
    "Drew":"/static/img/users/drew.jpeg",
    "Mark":"/static/img/users/mark.jpeg",
}


function getProfileURLForName(name) {
    if(name in nameImages) {
        return nameImages[name];
    } else {
        return getRandomProfileURL();
    }
}

function getRandomProfileURL() {
    var randomProfileImages = ["157875_714307_743900256_q.jpg",
    "161302_9102274_886654195_q.jpg",
    "174480_16820780_7820102_q.jpg",
    "186182_1496026749_7547165_q.jpg",
    "187069_714153_3743146_q.jpg",
    "211341_214500083_8181198_q.jpg",
    "260698_620410669_1248627382_q.jpg",
    "273540_544790187_4751197_q.jpg",
    "274318_724123036_2055327919_q.jpg",
    "370432_555599795_232385949_q.jpg",
    "370963_509300458_621846615_q.jpg",
    "371518_560795149_1523996772_q.jpg",
    "371785_214500107_966269545_q.jpg",
    "41730_214500043_537617273_q.jpg",
    "48801_930412_163473879_q.jpg",
    "572367_518786953_429537474_q.jpg"];

    return "/static/img/users/" + randomProfileImages[Math.floor(Math.random()*randomProfileImages.length)];
}


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
                avatarUrl:getProfileURLForName(userName)});
                
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
            
            io.sockets.in("room:" + data["room"]).emit("section", {"type":"chat", "admin":true, "message":"<b>"+userName + "</b> has joined the section."});
            
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
            
            logger.info("id: " + data["id"] + "; server_model.items.length: " + server_model.items.length);
            var sectionEvent = server_model.items[data["id"]];
            
            
            logger.info("id: " + data["id"] + " itemId: " + sectionEvent.id);
            sectionEvent.addVote();
            
            io.sockets.emit("vote", {id:data["id"]});
            logger.info("voting on " + data["id"] + " now " + sectionEvent.get("votes"));
        });
    });
    
    // socket.on("poll-vote", function(data) {
    //     socket.get("identity", function(err, userName) {
    //         socket.get("room", function(err, roomName) {
    //             var poll = sectionItems.get(data["pollId"]);
    //             poll.addVote(roomName, "/static/img/users/default.png", data["index"]);
    //         });
    //     });
    // });
    
    socket.on("disconnect", function(data) {
        socket.get("identity", function(err, userName) {
            socket.get("room", function(err, roomName) {
                // pull them out of their room.
                leaveRoom(roomName, socket);
                
            });
        });
    });
    
    socket.on("start-poll", function() {
        
        logger.info("STARTING POLL");
        
        var newPoll = new server_model.ServerItem({"type":"poll", "message":"this is a poll about which color is the best",
        "options":["red", "blue"]});
        
        io.sockets.emit("section", newPoll);
        
        startAutoPollVotes(newPoll.id);
    });
    
    socket.on("poll-vote", function(data) {
        socket.get("identity", function(err, userName) {
            // look up the item and broadcast a vote event for it.
            
            var poll = server_model.items[data["pollId"]];
            var voterUrl = "/static/img/users/mark.jpeg";
            
            poll.addSectionVote(data["index"], voterUrl);
            poll.addGlobalVote(data["index"], 1);
            
            // now broadcast this out to everyone.
            io.sockets.emit("poll-vote", {type:"section",
                "pollId":data["pollId"], "url":voterUrl,
                "index":data["index"]});
                
            io.sockets.emit("poll-vote", {type:"global",
                "pollId":data["pollId"], "num":1,
                "index":data["index"]});
            
        });
    });
    
    socket.on("sign-create", function(b64) {
      socket.get("identity", function(err, userName) {
        socket.get("room", function(err, roomName) {
          var url = 'static/img/signs/'+Date.now()+'.png';
          fs.writeFile(url, new Buffer(b64.match(/,(.+)/)[1], 'base64'), function(err) {
            var newSign = new server_model.ServerItem({
              type:"sign",
              name:userName,
              timestamp:new Date().getTime(),
              avatarUrl:getProfileURLForName(userName),
              url:url
            });
            io.sockets.in("room:" + roomName).emit("section",newSign.toJSON());
            sectionItems.add(newSign);
            logger.info("(" + roomName + ", " + newSign.id +") " + newSign.get("name") + ": " + newSign.get("url"));
          });              
        });
      });
    });
});

// every second for 10 seconds push a bunch of global votes down.

var pollCounter = 0;
function startAutoPollVotes(id) {
    
    if(pollCounter > 10) {
        return;
    }
    
    pollCounter++;
    setTimeout(startAutoPollVotes, 1000, id);
    
    // randomly add votes on either side of the issue.
    var poll = server_model.items[id];

    var votes = [Math.floor(Math.random()*100), Math.floor(Math.random()*100)];
    
    poll.addGlobalVote(0, votes[0]);
    poll.addGlobalVote(1, votes[1]);

    io.sockets.emit("poll-vote", {type:"global",
        "pollId":id, "num":votes[0],
        "index":0});
        
    io.sockets.emit("poll-vote", {type:"global",
        "pollId":id, "num":votes[1],
        "index":1});
}


// periodically publish pulse data.





function leaveRoom(roomName, socket) {
    
    socket.leave("room:" + roomName);
    
    logger.info("pop pre: " + JSON.stringify(roomPopulations));
    roomPopulations[roomName] = roomPopulations[roomName]-1;
    logger.info("pop post: " + JSON.stringify(roomPopulations));
    logger.info("roomPop: " + roomPopulations[roomName]);

    io.sockets.in("room:" + roomName).emit("population", {"population":roomPopulations[roomName]});
    
    socket.get("identity", function(err, userName) {
        logger.info(userName + " leaving " + roomName);
        io.sockets.in("room:" + roomName).emit("section", {"type":"chat", "admin":true, "message":"<b>"+userName + "</b> has left the section."});
    });
}

function joinRoom(roomName, socket) {
    
}

function generatePulse() {
    
    // auto cycle
    setTimeout(generatePulse, 2000);

    logger.info("PULSING");
    
    // pick three random items from the list with vote counts > 0.
    
    var pulseItems = [];
    
    while(true) {
        var nextItem = chooseRandomPulseItem();
        pulseItems.push(nextItem);
        
        if(_.isUndefined(nextItem)) {
            break;
        }
        
        if(nextItem.get("type")=="word") {
            pulseItems.push(chooseRandomPulseItem());
            pulseItems.push(chooseRandomPulseItem());
        }
        
        
        if(pulseItems.length >=3) {
            break;
        }
    }
    
    io.sockets.emit("pulse", {items:pulseItems});
}

function chooseRandomPulseItem() {
    var potentialItems = [
    {"type":"chat", "message":"YANKEES SUCK",
    "avatarUrl":getRandomProfileURL(), "name":"Drew"},
    {"type":"chat", "message":"LETS GO RED SOX LETS GO",
    "avatarUrl":getRandomProfileURL(), "name":"Drew"},
    {"type":"chat", "message":"If they don't make something happen this inning, they're never going to catch up.",
    "avatarUrl":getRandomProfileURL(), "name":"Mark"},

    {"type":"chat", "message":"YOOOOOUUUUUK IS BACK!",
    "avatarUrl":getRandomProfileURL(), "name":"Mark"},

    {"type":"chat", "message":"Man, what a pitching matchup between the @RedSox and @Yankees. 24 total strike outs. 12 by each team.",
    "avatarUrl":getRandomProfileURL(), "name":"Mark"},

    {"type":"chat", "message":"Damn you boston. Every time you give me hope, you just take it right back.",
    "avatarUrl":getRandomProfileURL(), "name":"Mark"},

    {"type":"chat", "message":" are the sox allergic to being over .500? Twice there, then losing streaks ensue.",
    "avatarUrl":getRandomProfileURL(), "name":"Mark"},

    {"type":"chat", "message":"Every time I walk by someone in a Yankees hat, I can't help but think: Douchebag!",
    "avatarUrl":getRandomProfileURL(), "name":"Mark"},

    {"type":"chat", "message":"How have they not pulled the pitcher yet? We'll never win if he stays in.",
    "avatarUrl":getRandomProfileURL(), "name":"Mark"},


    {"type":"sign", "url":"/static/img/signs/boo.png",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"sign", "url":"/static/img/signs/go_red_sox.png",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"sign", "url":"/static/img/signs/curse.png",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"sign", "url":"/static/img/signs/ball.png",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"sign", "url":"/static/img/signs/sweep.png",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"sign", "url":"/static/img/signs/outfield.png",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"sign", "url":"/static/img/signs/home_run.png",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"jeter",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"cano",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"a-rod",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"hr",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"k",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"strike",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"balk",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"single",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"double",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"triple",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"single",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"out",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"inning",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"lester",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"cc",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"rivera",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"beckett",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"pedroia",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"sox",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    {"type":"word", "word":"yankees",
    "avatarUrl":getRandomProfileURL(), "name":"drewwww"},
    ];
    // var itemsWithVotes = _.filter(server_model.items, function(item) {
    //     return item.get("votes")>0;
    // });
    
    // logger.info("itemsWithVotes: " + itemsWithVotes.length);
    
    var index = Math.floor(Math.random()*potentialItems.length);
    
    var dict = potentialItems[index];
    
    dict["timestamp"] = new Date().getTime();
    dict["votes"] = Math.floor(Math.random()*100);
    
    return new server_model.ServerItem(dict);
}

function publishPoll() {
    
}





