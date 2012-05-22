
pulse = {};

pulse.PulseView = Backbone.View.extend({
    id: 'pulse',
    
    template: _.template("<div id='pulse-container'></div>"),
    
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
   
   template: _.template("<img src='<%=url%>'>"),
   
   render: function() {
       this.$el.html(this.template(this.model.toJSON()));
       return this;
   }
});

pulse.TrendingWordView = Backbone.View.extend({
   className: "word pulse-item",
   
   template: _.template("<%=word%>"),
   
   render: function() {
       this.$el.html(this.template(this.model.toJSON()));
       return this;
   }
});

pulse.TrendingChatView = Backbone.View.extend({
    className: "chat pulse-item",

    template: _.template("<img src='<%=avatarUrl%>'><div class='message'>\
    <div class='openquote'>&ldquo;</div>\
    <div class='contents'><%=message%></div>\
    <div class='closequote'>&rdquo;</div><div></div>"),

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

pulse.Sign= Backbone.Model.extend({
    defaults: function() {
        return {"url":"/static/img/users/default.png",
                "votes":0};
    }
});

pulse.Word= Backbone.Model.extend({
    defaults: function() {
        return {"word":"/static/img/users/default.png",
                "votes":0};
    }
});

pulse.Row = Backbone.Model.extend({
    defaults: function() {
        return {"items":[]};
    },
    
    addItem: function(item) {
        this.get("items").push(item);
    }
});

pulse.Item = Backbone.Model.extend({
    
    defaults: function() {
        
        return {
        type: "sign",
        votes: 0,
        word: "none",
        url: "/static/img/users/default.png",
        name: "drewww",
        avatarUrl: "/static/img/users/default.png",
        };
    }
});

pulse.PulseCollection = Backbone.Collection.extend({
    "model":pulse.Item
});