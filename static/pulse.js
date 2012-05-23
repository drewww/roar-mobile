
(function () {
  var server = false,
    pulse;
  if (typeof exports !== 'undefined') {
    pulse = exports;
    server = true;
    
    _ = require('underscore');
    Backbone = require('backbone');
    
  } else {
    pulse = this.pulse = {};
  }


pulse.PulseView = Backbone.View.extend({
    id: 'pulse',
    
    template: _.template("<div id='pulse-container'></div>"),
    
    events: {
        'mousedown  .chat, .sign':'startTouch',
        'touchstart .chat, .sign':'startTouch',
        'mouseup  .chat, .sign':'endTouch',
        'touchend .chat, .sign':'endTouch',

    },
    
    touchStartTime: 0,
    
    initialize: function(args) {
        Backbone.Model.prototype.initialize.call(this, args);
        // console.log("INITIALZING PULSE VIEW");
        // this.$("#pulse-container").isotope({itemSelector:".pulse-item"});
        
        this.collection.on("add", function(item){
            var newView;
            if(item.get("type")=="sign") {
                newView = new pulse.SignView({"model":item}).render().el;
            } else if(item.get("type")=="word") {
                newView = new pulse.TrendingWordView({"model":item}).render().el;
            } else if(item.get("type")=="chat") {
                newView = new pulse.TrendingChatView({"model":item}).render().el;
            }
            
            if(!this.checkForInvisibleItems()) {
                this.$("#pulse-container").isotope( 'insert', $(newView));                
            }
            this.$("#pulse-container").isotope( 'reLayout');
            
        }, this);
    },
    
    startTouch: function(event) {
        event.currentTarget.timer = setTimeout(function() {
          conn.vote($(event.currentTarget).attr("item-id"));
        },1000);
        
        return false;
    },

    endTouch: function(event) {
      clearTimeout(event.currentTarget.timer);
      
      return false;
    },

    
    checkForInvisibleItems: function() {
        $.each($(".pulse-item"), function(key, value) {
            var rect = value.getBoundingClientRect();
            // console.log(rect);
            if(rect.top < -50) {
                console.log("FOUND ITEM");
                $("#pulse-container").isotope('remove', $(".pulse-item"));
                return true;
            }
        });
    },
    
    render: function() {
        this.$el.html(this.template());
        this.$("#pulse-container").isotope({itemSelector:".pulse-item",
        masonry: {
          columnWidth: 64
        },
        });
        
        return this;
    }
});

// pulse.RowView = Backbone.View.extend({
//     className: "row",
//     
//     template: _.template(""),
// 
//     render: function() {
//         
//         // loop through the different models
//         this.$el.html(this.template());
//         
//         _.each(this.model.get("items"), function(item) {
//             if(item instanceof pulse.Sign) {
//                 this.$el.append(new pulse.SignView({"model":item}).render().el);
//             } else if(item instanceof pulse.Word) {
//                 this.$el.append(new pulse.TrendingWordView({"model":item}).render().el);
//             } else if(item instanceof model.Chat) {
//                 this.$el.append(new pulse.TrendingChatView({"model":item}).render().el);
//             }
//         }, this);
//         
//         return this;
//     }
// });

pulse.SignView = Backbone.View.extend({
   className: "sign pulse-item",
   
   template: _.template("<img src='<%=url%>'><div class='votes'><%=votes%></div>"),
   
   initialize: function(args) {
       Backbone.View.prototype.initialize.call(this, args);
       
       this.model.on("change:votes", function() {
           this.$(".votes").text(this.model.get("votes"));
       }, this);
   },
   
   render: function() {
       this.$el.html(this.template(this.model.toJSON()));
       this.$el.attr("item-id", this.model.id);
       return this;
   }
});

pulse.TrendingWordView = Backbone.View.extend({
   className: "word pulse-item",
   
   template: _.template("<%=word%>"),
   
   
   initialize: function(args) {
       Backbone.View.prototype.initialize.call(this, args);
       
       this.model.on("change:votes", function() {
           this.$(".votes").text(this.model.get("votes"));
       }, this);
   },
   
   render: function() {
       this.$el.html(this.template(this.model.toJSON()));
       this.$el.attr("item-id", this.model.id);

       return this;
   }
});

pulse.TrendingChatView = Backbone.View.extend({
    className: "chat pulse-item",
    
    template: _.template("<img src='<%=avatarUrl%>'><div class='message'>\
    <div class='openquote'>&ldquo;</div>\
    <div class='contents'><%=message%></div>\
    <div class='closequote'>&rdquo;</div><div class='votes'><%=votes%></div></div>"),
    
    initialize: function(args) {
        Backbone.View.prototype.initialize.call(this, args);
        
        this.model.on("change:votes", function() {
            this.$(".votes").text(this.model.get("votes"));
        }, this);
    },
    
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.attr("item-id", this.model.id);
        
        return this;
    }
});

pulse.Sign= Backbone.Model.extend({
    defaults: function() {
        return {"url":"/static/img/users/default.png",
                "votes":0};
    },
    
    addVote: function() {
        this.set({"votes":this.get("votes")+1});
    }
});

pulse.Word= Backbone.Model.extend({
    defaults: function() {
        return {"word":"/static/img/users/default.png",
                "votes":0};
    }
});

// pulse.Row = Backbone.Model.extend({
//     defaults: function() {
//         return {"items":[]};
//     },
//     
//     addItem: function(item) {
//         this.get("items").push(item);
//     }
// });

pulse.Item = Backbone.Model.extend({
    
    defaults: function() {
        
        return {
        type: "sign",   // accepts "sign", "chat", "word" or "poll"
        votes: 0,
        word: "none",
        url: "/static/img/users/default.png",
        name: "drewww",
        message: "the message",
        avatarUrl: "/static/img/users/default.png",
        options: ["yes", "no"],
        totalVotes: [0, 0],                 // this is just arbitrary and fake
        sectionVoters: [[], []],    // this is going to be within a secion.
        };                          // sort of fake because it'll be just
                                    // one section.
    },
    
    addVote: function() {
        this.set({"votes":(this.get("votes")+1)});
    },
    
    addSectionVote: function(index, url) {
        var newSectionVotes = this.get("sectionVoters");
        newSectionVotes[index].push(url);
        this.set({"sectionVoters":newSectionVotes});
    },
    
    addGlobalVote: function(index, num) {
        var newTotalVotes = this.get("totalVotes");
        newTotalVotes[index] = newTotalVotes[index] + num;
        this.set({totalVotes:newTotalVotes});
    }
    
});

pulse.PulseCollection = Backbone.Collection.extend({
    "model":pulse.Item
});

})()