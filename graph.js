
var graph = {
  numNodes: graphDef[0][0],
  numEdges: graphDef[0][1],
  adjs: []
}

for(var i = 0; i < graph.numNodes; i++)
  graph.adjs[i] = [];

for(var i = 1; i <= graph.numEdges; i++) {
  var from = graphDef[i][0] - 1;
  var to = graphDef[i][1] - 1;

  graph.adjs[from].push(to);
  graph.adjs[to].push(from);
}
