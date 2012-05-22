views = {}

views.SectionView = Backbone.View.extend({  
  id: 'section',
  
  template: _.template("<div id='status'><h1></h1><h2></h2></div> \
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
            <li data-icon='contacts'><a class='section-link' data-name='MIT'><span class='population'>12</span> MIT <img class='friends' src='/static/img/users/drew.jpeg' /><img class='friends' src='/static/img/users/mark.jpeg' /></a></li> \
            <li data-icon='contacts'><a class='section-link' data-name='Reddit'><span class='population'>15</span> Reddit <img class='friends' src='/static/img/users/drew.jpeg' /></a></li> \
            <li data-icon='contacts'><a class='section-link' data-name='4chan'><span class='population'>23</span> 4chan <img class='friends' src='/static/img/users/mark.jpeg'></a></li> \
          </ul> \
        </li> \
        <li> \
          Popular \
          <ul> \
            <li data-icon='toprated'><a class='section-link' data-name='Boston'><span class='population'>563</span> Boston</a></li> \
            <li data-icon='toprated'><a class='section-link' data-name='MLB Playoffs'><span class='population'>342</span> MLB Playoffs</a></li> \
            <li data-icon='toprated'><a class='section-link' data-name='Mad Men'><span class='population'>111</span> Mad Men</a></li> \
          </ul> \
        </li> \
      </ul> \
    </div> \
  <div style='display:none;' id='events-list'></div><form id='post' style='display:none;'><input id='msg' type='text' placeholder='Enter message'></form><button style='display:none;' id='show-signcreate-view'>Sign</button>"),
  
  events: {
    'submit #creation':'createSection',
    'submit #post':'post',
    'touchstart #status':'showSections',
    'touchstart .tw-login':'twLogin',
    'touchstart .fb-login':'fbLogin',
    'touchstart .section-link':'setSection',
    'touchstart #show-signcreate-view':'showSign'
  },
  
  initialize: function(params) {
    conn.on('message.join-ok', function() {
      this.$('h1').text(conn.sectionName);
    }, this);
    views.conn.sectionItems.on('add', function(m,c) {
        
        console.log("new sectionItem: " + JSON.stringify(m));
        switch(m.get("type")) {
            case "chat":
                var newChat = new views.ChatView({model: new model.Chat(m.toJSON())});
                this.$('#events-list').append(newChat.render().el);
                break;
            case "sign":
                console.log("unsupported section events!");
                break;
            case "poll":
                var newPoll = new views.PollView({model:m});
                this.$('#events-list').append(newPoll.render().el);
                break;
        }
        
     // var new_chat = (m.get("")) ? new views.ChatView({model:m}) : new views.PollView({model:m});
     this.$('.chat-event:last').fadeIn('fast');
     this.$('#events-list').scrollTop(Math.pow(2,30));
    }, this);
    views.conn.sectionItems.on('reset', function(m, c) {
        this.$("#events-list").empty();
    }, this);
    
    conn.on('message.population', function(arg) {
        this.$("h2").text(arg["population"] + " people");
    }, this);
    
    // Simulate real-time population changes
    setInterval(function() {
     var $elem1 = $(this.$('.population')[Math.floor(Math.random() * 6)]);
     $elem1.text(parseInt($elem1.text())+Math.floor(Math.random()*5));
     if (parseInt($elem1.text()) < 0) $elem1.text(5);
     var $elem2 = $(this.$('.population')[Math.floor(Math.random() * 6)]);
     $elem2.text(parseInt($elem2.text())-Math.floor(Math.random()*5));
     if (parseInt($elem2.text()) < 0) $elem2.text(5);
    },2000);
  },
  
  createSection: function(event) {
    event.preventDefault();
    
    conn.join(this.$('#create').val());
    this.$('#section-select').animate({
      top: '-=1000px'
    }, 2000);
    this.$('#events-list,form,#show-signcreate-view').fadeIn(2000);
  },
  
  post: function(event) {
    event.preventDefault();
    if ($('#msg').val().length > 0) {
      views.conn.chat($('#msg').val());
      $('#msg').val('').focus();  
    }
  },
  
  showSections: function(event) {
    this.$('#section-select').animate({
      top: '+=1000px'
    }, 1000);
    this.$('#events-list,form,#show-signcreate-view').fadeOut(1000);
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
    conn.join($(event.target).data('name'));
    this.$('#section-select').animate({
      top: '-=1000px'
    }, 2000);
    this.$('#events-list,form,#show-signcreate-view').fadeIn(2000);
  },
  
  showSign: function(event) {
    var signcreate_view = new views.SignCreateView();
    $('#main').animate({
      'opacity': '0.5'
    }, function() {
      $('body').prepend(signcreate_view.render().el);
    });
  },
  
  render: function() {
    this.$el.html(this.template());
    this.$("#buttongroup").kendoMobileButtonGroup();
    
    return this;
  }
});

views.ChatView = Backbone.View.extend({
  className: 'chat-event',
  
  template:  _.template("<img class='profile' src='<%=avatarUrl%>' /><p class='text'><%=message%></p><br class='clear' />"),
  adminTemplate: _.template("<p class='text'><%=message%></p>"),
  
  render: function() {
    
    var templateToUse = this.template;
    if(this.model.get("admin")) {
        templateToUse = this.adminTemplate;
        
    }
    
    this.$el.html(templateToUse(this.model.toJSON()));
    
    if(this.model.get("admin")) {
        this.$el.attr("class", "chat-event admin");
    } else {
        this.$el.attr("class", "chat-event");
    }
    
    return this;
  }
});

views.PollView = Backbone.View.extend({
  className: 'poll-event',
  
  template: _.template("<div class='vote'>\
  <div class='prompt'><%=message%></div>\
  <div class='vote-button btn btn-red vote-left' voteIndex='0'><%=options[0]%></div>\
  <div class='results'>\
  <div class='section-results results-container'><div class='opt2'></div><div class='opt1 bar'></div></div>\
  <div class='global-results results-container'><div class='opt2'>0</div><div class='opt1 bar'>0</div></div>\
  <br class='clear'>\
  </div>\
  <div class='vote-right vote-button btn btn-blue' voteIndex='1'><%=options[1]%></div>\
  <br class='clear'>\
  </div>\
  "),
  
  events: {
      "touchend .btn": "vote",
  },
  
  initialize: function(args) {
      Backbone.View.prototype.initialize.call(this, args);
      
      conn.on("message.poll-vote", function() {
          console.log("UPDATING!");
        var sectionVotes = this.model.get("sectionVoters");
        var globalVotes = this.model.get("totalVotes");
        
        console.log("sectionVotes: " + JSON.stringify(sectionVotes));
        this.$(".section-results .opt2").html(this.generateVoterImgs(sectionVotes[1]));
        this.$(".section-results .opt1").html(this.generateVoterImgs(sectionVotes[0]));
        
        this.$(".section-results .opt1").css("width", (sectionVotes[0].length/(sectionVotes[0].length+sectionVotes[1].length))*100 + "%");
        
    	this.$(".global-results .opt2").text(globalVotes[1]);
    	this.$(".global-results .opt1").text(globalVotes[0]).css("width", (globalVotes[0]/(globalVotes[0]+globalVotes[1]))*100 + "%");
    	
        }, this);
  },
  
  generateVoterImgs: function(urlList) {
      console.log("GENERATING FOR LIST : " + urlList);
      var html = "";
      
      _.each(urlList, function(url) {
          html += "<img src='" + url + "'>";
      });
      
      return html;
  },
  
  vote: function() {
      // figure out what we're touching
      var btnIndex = $(event.target).attr("voteIndex");
      var parent = $(event.target).parent().parent();
      conn.votePoll(parent.attr("poll-id"), btnIndex);
  },
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.attr("poll-id", this.model.id);
    return this;
  }
});

views.SignCreateView = Backbone.View.extend({
  id: 'sign-create',
  
  events: {
    'touchmove #sign-canvas':'touchMove',
    'touchstart #clear-button':'clear',
    'touchstart #submit-button':'submit'
  },
  
  template: _.template("<canvas id='sign-canvas' width='960' height='540'></canvas><hr /> \
  <div id='sign-menu'> \
    <button id='clear-button' class='sign-button'>Clear</button> \
    <button id='submit-button' class='sign-button'>Submit</button> \
  </div>"),
  
  touchMove: function(event) {
    event.preventDefault();
    var ctx = event.target.getContext('2d');
    for (var i = 0; i < event.originalEvent.touches.length; i++) {
      var touch = event.originalEvent.touches[i];
      ctx.beginPath();
      ctx.arc(touch.pageX-50, touch.pageY-50, 10, 0, 2*Math.PI, true);
      ctx.fill();
      ctx.stroke();
    }
  },
  
  clear: function(event) {
    this.$("#sign-canvas")[0].width = 960;
  },
  
  submit: function(event) {
    $('#sign-create').hide(function() {
      $(this).remove();
    });
    $('#main').animate({
      'opacity': '1.0'
    },1000);
    conn.socket.emit('sign', this.$('#sign-canvas')[0].toDataURL('image/png'));
  },  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

views.MainView = Backbone.View.extend({
  id: 'main',
  
  initialize: function() {
    this.section = new views.SectionView();
    this.pulse = new pulse.PulseView({collection:views.conn.items});
  },
  
  template: _.template(""),
  
  render: function() {
    this.$el.html(this.template());
    this.$el.append(this.section.render().el);
    this.$el.append(this.pulse.render().el);
      
    return this;
  },
});

views.LoadView = Backbone.View.extend({
  id: 'load-view',
  
  events: {
    'touchstart':'loadMain'
  },
  
  template: _.template("<img id='roar-icon' src='/static/img/roar-wall.png' /><div id='loader-view'>Identifying TV Show...</div>"),
  
  loadMain: function(event) {
    main_view = new views.MainView();
    this.$el.fadeOut(function() {
      $(this).remove();
      $("body").append(main_view.render().el);
      window.kendoMobileApplication = new kendo.mobile.Application(document.body);  // Initialize Kendo ListView
    });
  },
  
  initialize: function(conn) {
    views.conn = conn;
  },
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
})
