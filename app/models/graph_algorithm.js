VisualAlgo.GraphAlgorithm = VisualAlgo.Algorithm.extend({
  graphBinding: 'VisualAlgo.GraphStore.current',

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
