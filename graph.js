
function newGraph(graphDef) {
  // TODO redesign the graph model from scratch
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
      // very inefficient!
      for(var i in this.adjs) {
        if(this.adjs[i] == null) continue;
        this.adjs[i].forEach(function(adj) {
          this.adjs[adj].splice(this.adjs[adj].indexOf(id), 1);
        }.bind(this));
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
    },

    isDirected: function() {
      return this.directed;
    },

    setDirected: function(value) {
      if(this.directed == value) return;
      if(!value) {
        var found = new Array(this.numNodes);
        for (var i = 0; i < this.numNodes; i++)
          found[i] = false;

        for (var i = 0; i < this.numNodes; i++) {
          if(this.adjs[i] == null || found[i]) continue;
          var q = [{ id: i, parent: null }];

          while(q.length > 0) {
            var curr = q.shift();
            if(found[curr.id]) continue;
            found[curr.id] = true;

            var foundParent = false;
            this.adjs[curr.id].forEach(function(adj) {
              q.push({ id: adj, parent: curr.id });
              if(adj == curr.parent) foundParent = true;
            });
            if(curr.parent != null && !foundParent)
              this.addEdge(curr.id, curr.parent);
          }
        }
      } else {
        this.numEdges *= 2;
      }
      this.directed = value;
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
