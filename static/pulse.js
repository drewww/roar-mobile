
pulse = {};

pulse.PulseView = Backbone.View.extend({
    id: 'pulse',
    
    template: _.template(""),
    
    initialize: function(args) {
        Backbone.Model.prototype.initialize.call(this, args);
        
        this.collection.on("add", function(){
            console.log("SOMETHING ADDED TO ROWS");
        }, this);
    },
    
    render: function() {
        this.$el.html(this.template());
        return this;
    }
});

pulse.RowView = Backbone.View.extend({
    className: "row",
    
    template: _.template(""),

    render: function() {
        
        // loop through the different models
        
        this.collection.each(function(model) {
            
            if(model instanceof Sign) {
                this.$el.append(new SignView(model).el);
            } else if(model instanceof TrendingWord) {
                this.$el.append(new TrendingWordView(model).el);
            } else if(model instanceof Chat) {
                this.$el.append(new TrendingChatView(model).el);
            }
        }, this);
        
        this.$el.html(this.template());
        return this;
    }
});

pulse.SignView = Backbone.View.extend({
   className: "sign",
   
   template: _.template("<img src='<%=url%>'>"),
   
   render: function() {
       this.$el.html(this.template());
       return this;
   }
});

pulse.TrendingWordView = Backbone.View.extend({
   className: "word",
   
   template: _.template("<%=word%>"),
   
   render: function() {
       this.$el.html(this.template());
       return this;
   }
});

pulse.TrendingChatView = Backbone.View.extend({
    className: "chat",

    template: _.template("<img src='<%=avatarUrl%>'><div class='message'><%=message%></div>"),

    render: function() {
        this.$el.html(this.template());
        return this;
    }
});

pulse.Sign= Backbone.View.extend({
    defaults: function() {
        return {"url":"/static/img/users/default.png",
                "votes":0};
    }
});

pulse.Word= Backbone.View.extend({
    defaults: function() {
        return {"word":"/static/img/users/default.png",
                "votes":0};
    }
});

pulse.Row = Backbone.Collection.extend({});

pulse.RowCollection = Backbone.Collection.extend({
    "model":pulse.Row
});