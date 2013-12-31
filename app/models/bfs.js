VisualAlgo.BFS = VisualAlgo.TraversalAlgorithm.create({
  name: "BFS",

  startAlgo: function(graph) {
    return this.bfs(graph, this.get("startAt"));
  },

  bfs: function* (graph, src) {
    var found = new Array(graph.getNodeCount());
    for (var i = 0; i < found.length; i++)
      found[i] = false;

    var q = [];
    q.push(src); found[src] = true;

    while(q.length > 0) {
      var curr = q.shift();

      yield ctl.view(function(v) { v.changeNodeState(curr, "", "current"); });
      yield ctl.step();
      yield ctl.view(function(v) { v.changeNodeState(curr, "current", "visited"); });

      graph.foreachAdj(curr, function(adj) {
        if(!found[adj]) {
          q.push(adj); found[adj] = true;
        }
      });
    }
  }
});
