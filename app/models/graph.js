
newGraph = function(graphDef) {
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
    },

    setDirected: function(dir) {
      if(this.directed == dir) return;
      if(dir) this.convertToDirected();
      else this.convertToUndirected();
    },

    convertToDirected: function() {
      this.directed = true;
      var that = this;
      this.foreachNode(function(id) {
        that.foreachAdj(id, function(adj, edgeData) {
          if(id < adj)
            that.addEdge(id, adj, $.extend({}, edgeData));
        });
      });
    },

    convertToUndirected: function(mergeFunc) {
      mergeFunc = mergeFunc || function() {};

      var visited = {};
      this.foreachNode(function(id) {
        if(visited[id]) return;

        var q = [{ id: id, parent: null, edge: null }];
        while(q.length > 0) {
          var curr = q.shift();

          if(curr.parent != null) {
            var backEdge = this.getEdge(curr.id, curr.parent);
            if(!backEdge) this.addEdge(curr.id, curr.parent, curr.edge);
            else mergeFunc(curr.edge, backEdge);
          }

          if(visited[curr.id]) continue;
          visited[curr.id] = true;

          this.foreachAdj(curr.id, function(adj, edgeData) {
            q.push({ id: adj, parent: curr.id, edge: edgeData });
          });
        }
      }.bind(this));
      this.directed = false;
    }
  };

  if(graphDef) {
    for(var i = 0; i < graphDef[0][0]; i++)
      graph.addNode(i);

    for(var i = 1; i <= graphDef[0][1]; i++) {
      var src = graphDef[i][0];
      var dest = graphDef[i][1];
      graph.addEdge(src, dest, { value: graphDef[i][2] || 1 });
    }
  }
  return graph;
}
