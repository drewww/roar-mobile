views = {}

views.SectionView = Backbone.View.extend({  
  id: 'section',
  
  template: _.template("<div id='status'><h1></h1><h2>2 people</h2></div> \
    <div id='section-select' data-role='view' data-title='Sections'> \
      <ul data-role='listview' data-style='inset' data-type='group'> \
        <li> \
          Search \
          <ul> \
            <li data-icon='search'><input type='text'></li> \
          </ul> \
        </li> \
        <li> \
          Friends \
          <ul> \
            <li data-icon='contacts'><a>MIT <span class='friends'>Drew, Bob, Alec</span></a></li> \
            <li data-icon='contacts'><a>Reddit</a></li> \
            <li data-icon='contacts'><a>4chan</a></li> \
          </ul> \
        </li> \
        <li> \
          Popular \
          <ul> \
            <li data-icon='toprated'><a>Boston</a></li> \
            <li data-icon='toprated'><a>Ottawa</a></li> \
            <li data-icon='toprated'><a>San Francisco</a></li> \
          </ul> \
        </li> \
      </ul> \
    </div> \
  <div style='display:none;' id='events-list'></div><form style='display:none;'><input id='msg' type='text' placeholder='Enter message'></form>"),
  
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

views.MainView = Backbone.View.extend({
  id: 'main',
  
  initialize: function(conn) {
    views.conn = conn;
    this.section = new views.SectionView();
    this.pulse = new pulse.PulseView({collection:conn.items});
  },
  
  template: _.template(""),
  
  render: function() {
    this.$el.html(this.template());
    this.$el.append(this.section.render().el);
    this.$el.append(this.pulse.render().el)
    
    return this;
  }
});