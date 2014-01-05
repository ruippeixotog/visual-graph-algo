VisualAlgo.TraversalAlgorithm = VisualAlgo.Algorithm.extend({

  inputView: Ember.View.extend({
    templateName: 'traversal_input'
  }),

  graphBinding: 'VisualAlgo.GraphStore.current',

  startAt: function() {
    return null;
  }.property(),

  reset: function() {
    var graph = this.get('graph');
    graph.foreachNode(function(node, nodeData) {
      nodeData.view = {};
      graph.foreachAdj(node, function(edge, edgeData) {
        edgeData.view = {};
      });
    });
  }
});
