VisualAlgo.UnionFind = Ember.Object.extend({
  _pset: [],

  initSet: function(size) {
    this._pset.length = size;
    for(var i = 0; i < size; i++) this._pset[i] = i;
  },

  findSet: function(i) {
    return (this._pset[i] == i) ? i : (this._pset[i] = this.findSet(this._pset[i]));
  },

  unionSet: function(i, j) {
    this._pset[this.findSet(i)] = this.findSet(j);
  },

  isSameSet: function(i, j) {
    return this.findSet(i) == this.findSet(j);
  }
});
