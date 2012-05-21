views = {}

views.SectionView = Backbone.View.extend({
  
});

views.StreamView = Backbone.View.extend({
  
});

views.MainView = Backbone.View.extend({
  id: 'main',
  
  initialize: function(conn) {
    views.conn = conn;
    this.section = new views.SectionView();
    this.stream = new views.StreamView();
  },
  
  template: _.template("<div id='section'>section</div><div id='stream'>stream</div>"),
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});