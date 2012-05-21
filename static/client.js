client = {};

client.ConnectionManager = function() {
    // Initialize a ConnectionManager object.
}

client.ConnectionManager.prototype = {
    
    user: null,
    socket: null,
    
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
            case "chat-ok":
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
    
    join: function(roomName) {
        this.socket.emit("join", {"room":roomName});
    }
}

client.log = function(msg) {
        console.log(msg);
}

_.extend(client.ConnectionManager.prototype, Backbone.Events);
