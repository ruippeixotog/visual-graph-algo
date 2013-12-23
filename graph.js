
function newGraph(graphDef) {
  var graph = {
    nodeData: {},
    nodeCount: 0,
    adjList: {},
    directed: false,

    addNode: function(id, data) {
      data = data || {};
      this.nodeData[id] = data;
      this.adjList[id] = {};

      this.nodeCount++;
      return data;
    },

    removeNode: function(id) {
      // inefficient!
      $.each(this.adjList, function(id2, adjs) {
        delete adjs[id];
      });

      delete this.adjList[id];
      delete this.nodeData[id];
      this.nodeCount--;
    },

    getNode: function(id) {
      return this.nodeData[id];
    },

    getNodeCount: function() {
      return this.nodeCount;
    },

    foreachNode: function(func) {
      $.each(this.nodeData, func);
    },

    addEdge: function(src, dest, data) {
      data = data || {};
      this.adjList[src][dest] = data;
      if(!this.directed) this.adjList[dest][src] = data;
      return data;
    },

    removeEdge: function(src, dest) {
      delete this.adjList[src][dest];
      if(!this.directed) delete this.adjList[dest][src];
    },

    getEdge: function(src, dest) {
      return this.adjList[src][dest];
    },

    foreachAdj: function(id, func) {
      $.each(this.adjList[id], func);
    },

    isDirected: function() {
      return this.directed;
    }

    // setDirected: function(value) {
    //   if(this.directed == value) return;
    //   if(!value) {
    //     var found = new Array(this.numNodes);
    //     for (var i = 0; i < this.numNodes; i++)
    //       found[i] = false;

    //     for (var i = 0; i < this.numNodes; i++) {
    //       if(this.adjs[i] == null || found[i]) continue;
    //       var q = [{ id: i, parent: null }];

    //       while(q.length > 0) {
    //         var curr = q.shift();
    //         if(found[curr.id]) continue;
    //         found[curr.id] = true;

    //         var foundParent = false;
    //         this.adjs[curr.id].forEach(function(adj) {
    //           q.push({ id: adj, parent: curr.id });
    //           if(adj == curr.parent) foundParent = true;
    //         });
    //         if(curr.parent != null && !foundParent)
    //           this.addEdge(curr.id, curr.parent);
    //       }
    //     }
    //   } else {
    //     this.numEdges *= 2;
    //   }
    //   this.directed = value;
    // }
  };

  if(graphDef) {
    for(var i = 0; i < graphDef[0][0]; i++)
      graph.addNode(i);

    for(var i = 1; i <= graphDef[0][1]; i++) {
      var src = graphDef[i][0] - 1;
      var dest = graphDef[i][1] - 1;
      graph.addEdge(src, dest);
    }
  }
  return graph;
}

var graph = newGraph(graphDef);
