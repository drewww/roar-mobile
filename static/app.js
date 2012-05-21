views = {}

views.SectionView = Backbone.View.extend({  
  id: 'section',
  
  template: _.template("<div id='status'><h1></h1><h2>2 people</h2></div> \
  <div id='section-select'> \
     
  </div><div style='display:none;' id='events-list'></div><form style='display:none;'><input id='msg' type='text' placeholder='Enter message'></form>"),
  
  events: {
    'submit form':'post'
  },
  
  initialize: function(params) {
    conn.on('message.join-ok', function() {
      this.$('h1').text(conn.sectionName);
    }, this);
    views.conn.sectionEvents.on('add', function(m,c) {
     var new_chat = (m instanceof model.Chat) ? new views.ChatView({model:m}) : new views.PollView({model:m});
     this.$('#events-list').append(new_chat.render().el);
     this.$('.chat-event:last').fadeIn('fast');
     this.$('#events-list').scrollTop(Math.pow(2,30));
    }, this);
  },
  
  post: function(event) {
    event.preventDefault();
    views.conn.chat($('#msg').val());
    $('#msg').val('').focus();
  },
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

views.ChatView = Backbone.View.extend({
  className: 'chat-event',
  
  template:  _.template("<img class='profile' src='<%=avatarUrl%>' /><p class='text'><%=message%></p>"),
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

views.PollView = Backbone.View.extend({
  className: 'poll-event',
  
  template: _.template(""),
  
  render: function() {
    this.$el.html(this.template(this.model));
  }
});

views.StreamView = Backbone.View.extend({
  id: 'stream',
  
  template: _.template("stuff"),
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

views.MainView = Backbone.View.extend({
  id: 'main',
  
  initialize: function(conn) {
    views.conn = conn;
    this.section = new views.SectionView();
    this.stream = new views.StreamView();
  },
  
  template: _.template(""),
  
  render: function() {
    this.$el.html(this.template());
    this.$el.append(this.section.render().el);
    this.$el.append(this.stream.render().el)
    
    return this;
  }
});