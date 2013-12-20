
function newGraph(graphDef) {
  var graph = {
    numNodes: 0,
    numEdges: 0,
    adjs: [],
    directed: false,

    addNode: function() {
      this.adjs.push([]);
      return this.numNodes++;
    },

    removeNode: function(id) {
      if(this.directed) {
        this.adjs[id].forEach(function(adj) {
          this.adjs[adj].splice(this.adjs[adj].indexOf(id), 1);
        });
      }
      this.adjs[id] = null;
    },

    hasEdge: function(src, dest) {
      for(var i in this.adjs[src]) {
        if(adjs[src][i] == dest) return true;
      }
      return false;
    },

    addEdge: function(src, dest) {
      this.adjs[src].push(dest);
      if(!this.directed) this.adjs[dest].push(src);
      this.numEdges++;
    },

    removeEdge: function(src, dest) {
      this.adjs[src].splice(this.adjs[src].indexOf(dest), 1);
      if(!this.directed)
        this.adjs[dest].splice(this.adjs[dest].indexOf(src), 1);
      this.numEdges--;
    }
  };

  if(graphDef) {
    for(var i = 0; i < graphDef[0][0]; i++)
      graph.addNode();

    for(var i = 1; i <= graphDef[0][1]; i++) {
      var src = graphDef[i][0] - 1;
      var dest = graphDef[i][1] - 1;
      graph.addEdge(src, dest);
    }
  }
  return graph;
}

var graph = newGraph(graphDef);
