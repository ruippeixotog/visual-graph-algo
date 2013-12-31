VisualAlgo.DFS = VisualAlgo.TraversalAlgorithm.create({
  name: "DFS",

  startAlgo: function(graph) {
    return this.dfs(graph, this.get("startAt"));
  },

  dfs: function* (graph, curr, visited) {
    visited = visited || {};
    if(visited[curr]) return;

    yield ctl.view(function(v) { v.changeNodeState(curr, "", "current"); });
    yield ctl.step();
    yield ctl.view(function(v) { v.changeNodeState(curr, "current", "visited"); });

    visited[curr] = true;

    for(adj in graph.adjList[curr]) {
      yield* this.dfs(graph, adj, visited);
    }
  }
});
