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
        
        // anything else to do on connect? probably not.
        // socket.on("chat", )
    },
    
    registerSocketListener: function(type) {
        client.log("Registering socket listener: " + type);
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
    },
    
    
    
    chat: function(msg) {
        socket.emit("chat", {"message": msg});
    },
    
    identify: function(name) {
        socket.emit("identify", {"name":name});
    },
}