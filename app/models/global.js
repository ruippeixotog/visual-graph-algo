VisualAlgo.Global = Ember.Object.extend({

  graph: function() {
    return newGraph(graphDefs["default"]);
  }.property()

}).create();
