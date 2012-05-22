views = {}

views.SectionView = Backbone.View.extend({  
  id: 'section',
  
  template: _.template("<div id='status'><h1></h1><h2>2 people</h2></div> \
    <div id='section-select' data-role='view' data-title='Sections'> \
      <div id='login' style='width:410px;margin-left:auto;margin-right:auto;'> \
        <img class='tw-login' src='/static/img/tw-logo.png' width='200' /> \
        <img class='fb-login' src='/static/img/fb-logo.png' width='200' /> \
      </div> \
      <ul data-role='listview' data-style='inset' data-type='group'> \
        <li> \
          Create \
          <ul> \
            <li data-icon='add'><form id='creation'><input id='create' type='text'></form></li> \
          </ul> \
        </li> \
        <li> \
          Friends \
          <ul> \
            <li data-icon='contacts'><a class='section-link'>MIT <img class='friends' src='/static/img/users/drew.jpeg' /><img class='friends' src='/static/img/users/mark.jpeg'></a></li> \
            <li data-icon='contacts'><a class='section-link'>Reddit</a></li> \
            <li data-icon='contacts'><a class='section-link'>4chan</a></li> \
          </ul> \
        </li> \
        <li> \
          Popular \
          <ul> \
            <li data-icon='toprated'><a class='section-link'>Boston</a></li> \
            <li data-icon='toprated'><a class='section-link'>Ottawa</a></li> \
            <li data-icon='toprated'><a class='section-link'>San Francisco</a></li> \
          </ul> \
        </li> \
      </ul> \
    </div> \
  <div style='display:none;' id='events-list'></div><form style='display:none;'><input id='msg' type='text' placeholder='Enter message'></form>"),
  
  events: {
    'submit #creation':'createSection',
    'submit form':'post',
    'click #status':'showSections',
    'click .tw-login':'twLogin',
    'click .fb-login':'fbLogin',
    'click .section-link':'setSection'
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
  
  createSection: function(event) {
    conn.join(this.$('#create').val());
    this.$('#section-select').animate({
      top: '-=1000px'
    }, 2000);
    this.$('#events-list,form').fadeIn(2000);
  },
  
  post: function(event) {
    event.preventDefault();
    views.conn.chat($('#msg').val());
    $('#msg').val('').focus();
  },
  
  showSections: function(event) {
    this.$('#section-select').animate({
      top: '+=1000px'
    }, 1000);
    this.$('#events-list,form').fadeOut(1000);
  },
  
  twLogin: function(event) {
    this.$('#login').replaceWith($("<img src='/static/img/users/mark.jpeg' width='32' /><b>Mark Fayngersh</b>"));
    conn.identify('Mark');
  },
  
  fbLogin: function(event) {
    this.$('#login').replaceWith($("<img src='/static/img/users/drew.jpeg' width='32' /><b>Drew Harry</b>"));
    conn.identify('Drew')
  },
  
  setSection: function(event) {
    conn.join($(event.target).text());
    this.$('#section-select').animate({
      top: '-=1000px'
    }, 2000);
    this.$('#events-list,form').fadeIn(2000);
  },
  
  render: function() {
    this.$el.html(this.template());
    this.$("#buttongroup").kendoMobileButtonGroup();
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