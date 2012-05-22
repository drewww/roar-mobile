client = {};

client.ConnectionManager = function() {
    // Initialize a ConnectionManager object.
}

client.ConnectionManager.prototype = {
    
    user: null,
    socket: null,
    sectionEvents: new model.SectionEventCollection(),
    sectionName: null,
    items: new pulse.PulseCollection(),
    population: 0,
    
    
    connect: function(host, port) {
        this.socket = io.connect("http://" + host + ":" + port, {'force new connection': true,
            rememberTransport: false, 
            'reconnect': true,
            'reconnection delay': 500,
            'max reconnection attempts': 10}).on('connect',
            function(data) {
                // do something
            });
        
        this.socket["manager"] = this;
        
        // anything else to do on connect? probably not.
        // socket.on("chat", )
        
        this.registerSocketListener("chat");
        this.registerSocketListener("identify-ok");
        this.registerSocketListener("vote");
        this.registerSocketListener("poll");
        this.registerSocketListener("join-ok");
        this.registerSocketListener("leave-ok");

        this.registerSocketListener("pulse");

        this.registerSocketListener("population");

    },
    
    registerSocketListener: function(type) {
        this.socket.on(type, function(data) {
            this.manager.receivedMessage.call(this.manager, type, data);
        });
    },
    
    
    receivedMessage: function(type, data) {
        
        client.log("message." + type);
        
        var arg = data;
        
        switch(type) {
            case "chat":
                var newChat = new model.Chat(data);
                this.sectionEvents.add(newChat);
                console.log("CHAT: " + JSON.stringify(newChat));
                break;
            case "chat-ok":
                break;
            
            case "poll":
                var newPoll = new model.Poll(data);
                this.sectionEvents.add(newPoll);
                
                console.log("POLL: " + JSON.stringify(newPoll));
                
                break;
                
            case "vote":
                var sectionEvent = this.sectionEvents.get(data["id"]);
                
                if(!_.isUndefined(sectionEvent)) {
                    sectionEvent.addVote();
                }
                
                console.log("VOTE: " + JSON.stringify(data));
                break;
            case "poll-vote":
                var sectionEvent = this.sectionEvents.get(data["id"]);
                
                if(!_.isUndefined(sectionEvent)) {
                    sectionEvent.addVote(data);
                }
                
                console.log("POLLVOTE: " + JSON.stringify(data));
                
                break;
            case "join-ok":
                console.log("JOIN OKAY! " + data["room"]);
                this.sectionName = data["room"];
                this.sectionEvents.reset();
                break;
            
            case "pulse":
                console.log("PULSE");
                
                // so the structure for a pulse message is:
                // some set of N items with a type and a payload.
                
                for(var i in data["items"]) {
                    var item = data["items"][i];
                    console.log("ITEM: " + JSON.stringify(item));
                    
                    switch(item.type) {
                        case "chat":
                            this.items.add(new model.Chat(item));
                            break;
                        case "sign":
                            this.items.add(new pulse.Sign(item));
                            break;
                        case "word":
                            this.items.add(new pulse.Word(item));
                            break;
                    }
                    
                }
                
                break;
            case "population":
                console.log("message: " + JSON.stringify(data));
                console.log("POPULATION: " + arg["population"]);
                this.population = arg["population"];
                // this.trigger("population");
                break;
            case "identity-ok":
                console.log("identity okay!");
                this.user = arg["name"];
                break;
        }
        
        this.trigger("message." + type, arg);
    },
    
    chat: function(msg) {
        this.socket.emit("chat", {"message": msg});
    },
    
    identify: function(name) {
        this.socket.emit("identify", {"name":name});
    },
    
    vote: function(id) {
        this.socket.emit("vote", {"id": id});
    },
    
    pollVote: function(pollId, index) {
        this.socket.emit("poll-vote", {"pollId":pollId, "index":index});
    },
    
    join: function(roomName) {
        this.socket.emit("join", {"room":roomName});
    }
}

client.log = function(msg) {
        console.log(msg);
}

_.extend(client.ConnectionManager.prototype, Backbone.Events);
