(function () {
  var server = false,
    model;
  if (typeof exports !== 'undefined') {
    model = exports;
    server = true;
    
    _ = require('underscore');
    Backbone = require('backbone');
    
  } else {
    model = this.model = {};
  }
  

model.SectionEvent = Backbone.Model.extend({
    
    defaults: function() {
        
        return {
        timestamp: new Date().getTime(),
        name: "default user",
        avatarUrl: "/static/img/users/default.png",
        };
    }
});

model.Chat = model.SectionEvent.extend({
    defaults: function() {
        var defaults = model.SectionEvent.prototype.defaults.call(this);
        
        defaults["message"] = "default chat message";
        return defaults;
    }
});

model.SectionEventCollection = Backbone.Collection.extend({
    "model": model.SectionEvent,
});

model.Poll = model.SectionEvent.extend({
    
    initialize: function(args) {
        model.SectionEvent.prototype.initialize.call(this, args);
        
    },
    
    defaults: function() {
        
        return {
            avatarUrl: "/static/img/users/default.png",
            prompt: "default poll prompt",
            options: ["yes", "no"],
            totals: [0, 0],
            sectionTotals: {},
            sectionAvatarUrls: {},
        }
    },
    
    // pass in the name of a section and the index of the
    // vote option that they're voting for.
    addVote: function(section, avatarUrl, index) {
        
        var votes = [0, 0];
        if(section in sectionTotals) {
            votes = sectionTotals[section];
        }
        
        var avatarUrls = [[], []];
        if(section in sectionAvatarUrls) {
            avatarUrls = sectionAvatarUrls[section];
        }
        
        votes[index] = votes[index]+1;
        avatarUrls[index].push(avatarUrl);
        
        sectionTotals[section] = votes;
        sectionAvatarUrls[section] = avatarUrls;
    }
});

})()