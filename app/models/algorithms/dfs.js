VisualAlgo.DFS = VisualAlgo.TraversalAlgorithm.create({
  name: "DFS",

  startAlgo: function() {
    return this.dfs(this.get('graph'), this.get("startAt"));
  },

  dfs: function* (graph, curr, visited) {
    visited = visited || {};
    if(visited[curr]) return;

    graph.getNode(curr).view.classes = ["current"];
    yield this.step;
    graph.getNode(curr).view.classes = ["visited"];

    visited[curr] = true;

    for(adj in graph._adjList[curr]) { // TODO: dfs cannot depend directly on _adjList
      yield* this.dfs(graph, adj, visited);
    }
  }
});
