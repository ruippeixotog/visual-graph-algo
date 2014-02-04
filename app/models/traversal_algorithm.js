VisualAlgo.TraversalAlgorithm = VisualAlgo.GraphAlgorithm.extend({

  domClass: function() {
    return "algo-traversal " + this._super();
  }.property('name'),

  inputView: Ember.View.extend({
    templateName: 'traversal_input'
  }),

  enableDirectedChoice: true,

  startAt: function() {
    return null;
  }.property()
});
