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

    var color = d3.scale.category20();
//    var scale = d3.scale.linear()
//      .domain([0, graph.getNodeCount()])
//      .range(["white", "#0000dd"]);

    function updateColors() {
      graph.foreachNode(function(node, nodeData) {
        nodeData.view.style = "fill: " +
          d3.rgb(color(uf.findSet(Number(node)))).brighter(0.8).toString()
      });
    }

    updateColors();

    // get all edges into an array and sort them by weight
    var edges = [];
    graph.foreachNode(function(node) {
      graph.foreachAdj(node, function(adj, edgeData) {
        if(node < adj) edges.push({
          src: Number(node), dest: Number(adj), weight: Number(edgeData.value)
        });
      });
    });
    edges.sort(function(a, b) { return a.weight > b.weight });

    for(var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var edgeData = graph.getEdge(e.src, e.dest);

      edgeData.view.classes = ["current"];
      yield this.step;

      if(!uf.isSameSet(e.src, e.dest)) {
        uf.unionSet(e.src, e.dest);
        edgeData.view.classes = ["solution"];
        updateColors();

      } else {
        edgeData.view.classes = ["visited"];
      }
    }
  }
});
