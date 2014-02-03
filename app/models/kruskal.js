VisualAlgo.Kruskal = VisualAlgo.GraphAlgorithm.create({
  name: "Kruskal",

  inputView: Ember.View.extend({
    templateName: '_graph_editor'
  }),

  showEdgeValues: true,

  startAlgo: function() {
    return this.mst(this.get('graph'));
  },

  mst: function* (graph) {
    graph = this.get('graph');

    // init an union-find structure and paint all nodes with a different color
    var uf = VisualAlgo.UnionFind.create();
    uf.initSet(graph.getNodeCount());

//    function colorFor(node) {
//      var hexStr = Math.floor(
//        63 + (uf.findSet(node) + 1) / graph.getNodeCount() * 192).toString(16);
//      return "#" + hexStr + hexStr + hexStr;
//    }
//
//    graph.foreachNode(function(node, nodeData) {
//      nodeData.view.style = "fill: " + colorFor(Number(node));
//    });

    // get all edges into an array and sort them by weight
    var edges = [];
    graph.foreachNode(function(node) {
      graph.foreachAdj(node, function(adj, edgeData) {
        if(node < adj) edges.push([edgeData.value, Number(node), Number(adj)]);
      });
    });
    edges.sort();

    for(var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var edgeData = graph.getEdge(e[1], e[2]);

      edgeData.view.classes = ["current"];
      yield this.step;

      if(!uf.isSameSet(e[1], e[2])) {
        uf.unionSet(e[1], e[2]);

        edgeData.view.classes = ["solution"];
//        graph.getNode(e[1]).view.style = "fill: " + colorFor(e[1]);
//        graph.getNode(e[2]).view.style = "fill: " + colorFor(e[2]);

      } else {
        edgeData.view.classes = ["visited"];
      }
    }
  }
});
