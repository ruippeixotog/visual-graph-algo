
function* dfs(graph, curr, visited) {
  visited = visited || {};
  if(visited[curr]) return;

  yield ctl.view(function(v) { v.changeNodeState(curr, "", "current"); });
  yield ctl.step();
  yield ctl.view(function(v) { v.changeNodeState(curr, "current", "visited"); });

  visited[curr] = true;

  for(adj in graph.adjList[curr]) {
    yield* dfs(graph, adj, visited);
  }
}
