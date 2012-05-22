var _ = require('underscore')._
    Backbone = require('backbone'),
    winston = require('winston'),
    model = require('../static/model.js');
    pulse = require('../static/pulse.js');

var logger= new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            filename:'server.log',
            timestamp:true,
            json:false,
            level: 'debug'
            })
    ],
    levels: winston.config.syslog.levels
});


server_model = exports;
server_model.items = [];
// we need to keep track of chat messages, signs, and polls. these will have
// server objects. they will be mostly separate from their client equivalents
// because I'm too lazy to actually hook them together directly. 

var nextSectionEventId = 0;

// server_model.ServerChat = model.Chat.extend({
//     initialize: function(args) {
//         model.Chat.prototype.initialize.call(this, args);
//         
//         if(_.isUndefined(args) || !("id" in args)) {
//             var nextId = nextSectionEventId;
//             this.set({id:nextId});
//             
//             nextSectionEventId++;
//         }
//         
//         server_model.items[this.id] = this;
//     }
// });


// this is super wonky, but serveritem is anything in the pulse stream
// but they're put in the same hash with Serverchats because they share
// an id space. this is sort of ridiculous but I'm not really sure what
// to do about it. 
server_model.ServerItem = pulse.Item.extend({
    initialize: function(args) {
        pulse.Item.prototype.initialize.call(this, args);
        
        if(_.isUndefined(args) || !("id" in args)) {
            var nextId = nextSectionEventId;
            this.set({id:nextId});
            
            nextSectionEventId++;
        }
        
        server_model.items.push(this);
    }
});