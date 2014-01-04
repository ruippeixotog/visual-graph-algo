VisualAlgo.Graph = Ember.Object.extend({

  _nodeData: {},
  _adjList: {},
  _directed: false,

  nodeCount: 0,

  addNode: function(id, data) {
    data = data || {};
    this._nodeData[id] = data;
    this._adjList[id] = {};

    this.nodeCount++;
    return data;
  },

  removeNode: function(id) {
    // inefficient!
    $.each(this._adjList, function(id2, adjs) {
      delete adjs[id];
    });

    delete this._adjList[id];
    delete this._nodeData[id];
    this.nodeCount--;
  },

  getNode: function(id) {
    return this._nodeData[id];
  },

  getNodeCount: function() {
    return this.nodeCount;
  },

  foreachNode: function(func) {
    $.each(this._nodeData, func);
  },

  addEdge: function(src, dest, data) {
    data = data || {};
    this._adjList[src][dest] = data;
    if(!this.isDirected()) this._adjList[dest][src] = data;
    return data;
  },

  removeEdge: function(src, dest) {
    delete this._adjList[src][dest];
    if(!this.isDirected()) delete this._adjList[dest][src];
  },

  getEdge: function(src, dest) {
    return this._adjList[src][dest];
  },

  foreachAdj: function(id, func) {
    $.each(this._adjList[id], func);
  },

  isDirected: function() {
    return this.get('_directed');
  },

  setDirected: function(dir) {
    if(this.isDirected() == dir) return;
    if(dir) this.convertToDirected();
    else this.convertToUndirected();
  },

  convertToDirected: function() {
    this.set('_directed', true);
    var that = this;
    this.foreachNode(function(id) {
      that.foreachAdj(id, function(adj, edgeData) {
        if(id < adj)
          that.addEdge(id, adj, $.extend({}, edgeData));
      });
    });
  },

  convertToUndirected: function(mergeFunc) {
    mergeFunc = mergeFunc || function(a, b) { return a; };

    var visited = {};
    this.foreachNode(function(id) {
      if(visited[id]) return;

      var q = [{ id: id, parent: null, edge: null }];
      while(q.length > 0) {
        var curr = q.shift();

        if(curr.parent != null) {
          var backEdge = this.getEdge(curr.id, curr.parent);
          if(!backEdge) this.addEdge(curr.id, curr.parent, curr.edge);
          else {
            var mergedEdge = mergeFunc(curr.edge, backEdge);
            this.addEdge(curr.id, curr.parent, mergedEdge);
            this.addEdge(curr.parent, curr.id, mergedEdge);
          }
        }

        if(visited[curr.id]) continue;
        visited[curr.id] = true;

        this.foreachAdj(curr.id, function(adj, edgeData) {
          q.push({ id: adj, parent: curr.id, edge: edgeData });
        });
      }
    }.bind(this));
    this.set('_directed', false);
  },

  graphDef: function(key, value) {
    if(arguments.length > 1) {
      this._nodeData = {};
      this._adjList = {};

      for(var i = 0; i < value[0][0]; i++)
        this.addNode(i);

      for(var i = 1; i <= value[0][1]; i++) {
        var src = value[i][0];
        var dest = value[i][1];
        this.addEdge(src, dest, { value: value[i][2] || 1 });
      }
      return this;

    } else {
      var def = [[]];

      var nid = {}, nodeIndex = 0;
      this.foreachNode(function(id) {
        nid[id] = nodeIndex++;
      });

      this.foreachNode(function(id) {
        this.foreachAdj(id, function(adj, edgeData) {
          if(!this.isDirected() && adj < id) return;
          def.push((edgeData.value == undefined ?
            [nid[id], nid[adj]] :
            [nid[id], nid[adj], edgeData.value]));
        });
      });

      def[0] = [this.getNodeCount(), def.length - 1];
      return def;
    }
  }.property(), // TODO: not updated when the graph updates

  directed: function(key, value) {
    if(arguments.length > 1) {
      this.setDirected(value);
      return value;
    } else {
      return this.isDirected();
    }
  }.property('_directed')
});
