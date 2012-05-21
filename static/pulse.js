
pulse = {};

pulse.PulseView = Backbone.View.extend({
    id: 'pulse',
    
    template: _.template(""),
    
    initialize: function(args) {
        Backbone.Model.prototype.initialize.call(this, args);
        
        this.collection.on("add", function(newRow){
            this.$el.append(new pulse.RowView({model:newRow}).render().el);
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
        
        _.each(this.model.get("items"), function(item) {
            
            if(item instanceof pulse.Sign) {
                this.$el.append(new pulse.SignView(item).el);
            } else if(item instanceof pulse.Word) {
                this.$el.append(new pulse.TrendingWordView(item).el);
            } else if(item instanceof model.Chat) {
                this.$el.append(new pulse.TrendingChatView(item).el);
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

pulse.RowCollection = Backbone.Collection.extend({
    "model":pulse.Row
});