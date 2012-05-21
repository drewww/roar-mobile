views = {}

views.SectionView = Backbone.View.extend({  
  id: 'section',
  
  template: _.template("<div id='status'>status</div><div id='events-list'></div><input id='msg' type='text' placeholder='Enter message'>"),
  
  events: {
    'submit form':'post'
  }
  
  initialize: function(params) {
    
  },
  
  post: function(event) {
    
  }
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

views.ChatView = Backbone.View.extend({
  className: 'chat-event',
  
  _.template("<img class='profile' src='/static/img/users/<%= user %>' /> <p class='text'><%= text %></p>"),
  
  render: function() {
    
  }
});

views.MainView = Backbone.View.extend({
  id: 'main',
  
  initialize: function(conn) {
    views.conn = conn;
    this.section = new views.SectionView();
    this.pulse = new pulse.PulseView();
  },
  
  template: _.template(""),
  
  render: function() {
    this.$el.html(this.template());
    this.$el.append(this.section.render().el);
    this.$el.append(this.pulse.render().el)
    
    return this;
  }
});