
function newGraph(graphDef) {
  var graph = {
    numNodes: graphDef[0][0],
    numEdges: graphDef[0][1],
    adjs: [],

    addNode: function() {
      graph.adjs.push([]);
      return graph.numNodes++;
    },

    removeNode: function(id) {
      graph.adjs[id].forEach(function(adj) {
        graph.adjs[adj].splice(graph.adjs[adj].indexOf(id), 1);
      });
      graph.adjs[id] = null;
    },

    addEdge: function(src, dest) {
      graph.adjs[src].push(dest);
      graph.adjs[dest].push(src);
      ++graph.numEdges;
    },

    removeEdge: function(src, dest) {
      graph.adjs[src].splice(graph.adjs[src].indexOf(dest), 1);
      graph.adjs[dest].splice(graph.adjs[dest].indexOf(src), 1);
      --graph.numEdges;
    }
  };

  if(graphDef) {
    for(var i = 0; i < graph.numNodes; i++)
      graph.adjs[i] = [];

    for(var i = 1; i <= graph.numEdges; i++) {
      var from = graphDef[i][0] - 1;
      var to = graphDef[i][1] - 1;

      graph.adjs[from].push(to);
      graph.adjs[to].push(from);
    }
  }
  return graph;
}

var graph = newGraph(graphDef);
