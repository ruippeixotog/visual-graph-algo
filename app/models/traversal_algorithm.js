VisualAlgo.TraversalAlgorithm = VisualAlgo.GraphAlgorithm.extend({
  categories: ["traversal"],

  domClass: function() {
    return "algo-traversal " + this._super();
  }.property('name'),

  enableDirectedChoice: true,

  startAt: function() {
    return null;
  }.property()
});
