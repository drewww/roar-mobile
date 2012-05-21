var _ = require('underscore')._
    Backbone = require('backbone'),
    winston = require('winston'),
    model = require('../static/model.js');

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

// we need to keep track of chat messages, signs, and polls. these will have
// server objects. they will be mostly separate from their client equivalents
// because I'm too lazy to actually hook them together directly. 

var nextSectionEventId = 0;

server_model.ServerChat = model.Chat.extend({
    initialize: function(args) {
        model.Chat.prototype.initialize.call(this, args);
        
        if(_.isUndefined(args) || !("id" in args)) {
            var nextId = nextSectionEventId;
            this.set({id:nextId});
            
            nextSectionEventId++;
        }
    }
});

