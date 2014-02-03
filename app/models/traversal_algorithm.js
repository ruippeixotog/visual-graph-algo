VisualAlgo.TraversalAlgorithm = VisualAlgo.GraphAlgorithm.extend({

  inputView: Ember.View.extend({
    templateName: 'traversal_input'
  }),

  enableDirectedChoice: true,

  startAt: function() {
    return null;
  }.property()
});
