VisualAlgo.TraversalAlgorithm = VisualAlgo.Algorithm.extend({

  inputView: Ember.View.extend({
    templateName: 'traversal_input'
  }),

  startAt: function() {
    return null;
  }.property()
});
