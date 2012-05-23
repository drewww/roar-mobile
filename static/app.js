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
            <li data-icon='contacts'><a class='section-link' data-name='MIT'><span class='population'>12</span> MIT <img class='friends' src='/static/img/users/371518_560795149_1523996772_q.jpg' /><img class='friends' src='/static/img/users/370963_509300458_621846615_q.jpg' /></a></li> \
            <li data-icon='contacts'><a class='section-link' data-name='Somerville'><span class='population'>15</span> Somerville <img class='friends' src='/static/img/users/211341_214500083_8181198_q.jpg' /> <img class='friends' src='/static/img/users/157875_714307_743900256_q.jpg' /> <img class='friends' src='/static/img/users/161302_9102274_886654195_q.jpg' /></a></li> \
            <li data-icon='contacts'><a class='section-link' data-name='Jen & Friends'><span class='population'>23</span> Jen & Friends <img class='friends' src='/static/img/users/274318_724123036_2055327919_q.jpg'></a></li> \
          </ul> \
        </li> \
        <li> \
          Popular \
          <ul> \
            <li data-icon='toprated'><a class='section-link' data-name='Red Sox'><span class='population'>563</span> Red Sox</a></li> \
            <li data-icon='toprated'><a class='section-link' data-name='Yankees'><span class='population'>342</span> Yankees</a></li> \
            <li data-icon='toprated'><a class='section-link' data-name='/r/baseball'><span class='population'>133</span> /r/baseball</a></li> \
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
                var newSign = new views.SignView({model:m});
                this.$('#events-list').append(newSign.render().el);
                break;
            case "poll":
                var newPoll = new views.PollView({model:m});
                this.$('#events-list').append(newPoll.render().el);
                break;
        }
        
     // var new_chat = (m.get("")) ? new views.ChatView({model:m}) : new views.PollView({model:m});
     this.$('.chat-event:last').fadeIn('fast');
     this.$('.sign-event:last').fadeIn('fast');
     this.$('#events-list').scrollTop(Math.pow(2,30));
    }, this);
    views.conn.sectionItems.on('reset', function(m, c) {
        this.$("#events-list").empty();
    }, this);
    
    conn.on('message.population', function(arg) {
      (parseInt(arg["population"]) == 1) ? this.$("h2").text(arg["population"] + " person") : this.$("h2").text(arg["population"] + " people");
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
    this.$('#login').replaceWith($("<img style='margin-left:10px;' src='/static/img/users/mark.jpeg' width='32' /><b style='position:relative;top:3px;margin-left:5px;font-size:20px;'>Mark Fayngersh</b>"));
    conn.identify('Mark');
  },
  
  fbLogin: function(event) {
    this.$('#login').replaceWith($("<img style='margin-left:10px;' src='/static/img/users/drew.jpeg' width='32' /><b style='position:relative;top:3px;margin-left:5px;font-size:20px;'>Drew Harry</b>"));
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
      views.conn.pulseEnabled = false;
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
    'touchstart .color-button':'setColor',
    'touchstart .width-button':'setWidth',
    'touchstart #submit-button':'submit'
  },
  
  template: _.template("<canvas id='sign-canvas' width='960' height='540'></canvas><hr /> \
  <div id='sign-menu'> \
    <button id='clear-button' class='sign-button'>Clear</button> \
    <span id='colors'> \
      <button style='background-color:#000000;' data-color='#000000' class='color-button'>&nbsp;&nbsp;&nbsp;</button> \
      <button style='background-color:#F2F2F2;' data-color='#F2F2F2' class='color-button'>&nbsp;&nbsp;&nbsp;</button> \
      <button style='background-color:#69D2E7;' data-color='#69D2E7' class='color-button'>&nbsp;&nbsp;&nbsp;</button> \
      <button style='background-color:#FA6900;' data-color='#FA6900' class='color-button'>&nbsp;&nbsp;&nbsp;</button> \
      <button style='background-color:#542437;' data-color='#542437' class='color-button'>&nbsp;&nbsp;&nbsp;</button> \
      <button style='background-color:#F8CA00;' data-color='#F8CA00' class='color-button'>&nbsp;&nbsp;&nbsp;</button> \
      <button style='background-color:#8A9B0F;' data-color='#8A9B0F' class='color-button'>&nbsp;&nbsp;&nbsp;</button> \
    </span> \
    <span id='widths'> \
      <button style='font-size:10px;' data-width='10' class='width-button'>•</button> \
      <button style='font-size:20px;' data-width='25' class='width-button'>•</button> \
    </span> \
    <button id='submit-button' class='sign-button'>Submit</button> \
  </div>"),
  
  touchMove: function(event) {
    event.preventDefault();
    var ctx = event.target.getContext('2d');
    for (var i = 0; i < event.originalEvent.touches.length; i++) {
      var touch = event.originalEvent.touches[i];
      ctx.beginPath();
      ctx.arc(touch.pageX-50, touch.pageY-50, this.currentWidth, 0, 2*Math.PI, true);
      ctx.strokeStyle = this.currentColor;
      ctx.fillStyle = this.currentColor;
      ctx.fill();
      ctx.stroke();
    }
  },
  
  clear: function(event) {
    this.$("#sign-canvas")[0].width = 960;
  },
  
  setColor: function(event) {
    this.currentColor = $(event.target).data('color');
  },
  
  setWidth: function(event) {
    this.currentWidth = parseInt($(event.target).data('width'));
  },
  
  submit: function(event) {
    $('#sign-create').hide(function() {
      $(this).remove();
      views.conn.pulseEnabled = true;
    });
    $('#main').animate({
      'opacity': '1.0'
    },1000);
    conn.socket.emit('sign-create', this.$('#sign-canvas')[0].toDataURL('image/png'));
  },  
  
  initialize: function() {
    this.currentColor = '#000';
    this.currentWidth = 10;
  },
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

views.SignView = Backbone.View.extend({
  className: 'sign-event',
  
  template: _.template("<img class='profile' src='<%=avatarUrl%>' /><img class='sign-img' src='<%=url%>' /><br class='clear' />"),
  
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
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
