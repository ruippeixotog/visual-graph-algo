
function* bfs(src) {
  var found = new Array(graph.getNodeCount());
  for (var i = 0; i < found.length; i++)
    found[i] = false;

  var q = [];
  q.push(src); found[src] = true;

  while(q.length > 0) {
    var curr = q.shift();

    graphView.changeNodeState(curr, "", "current");
    yield 0;
    graphView.changeNodeState(curr, "current", "visited");

    graph.foreachAdj(curr, function(adj) {
      if(!found[adj]) {
        q.push(adj); found[adj] = true;
      }
    });
  }
}
