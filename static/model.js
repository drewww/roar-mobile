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

})()