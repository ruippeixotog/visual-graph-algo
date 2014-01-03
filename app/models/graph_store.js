VisualAlgo.GraphStore = Ember.Object.create({

  current: null,

  examples: Ember.A([
    Ember.Object.create({ name: "default", graph: newGraph([
      [7, 7],
      [0, 3, 2],
      [3, 4, 5],
      [4, 1, 2],
      [0, 6, 3],
      [6, 4, 3],
      [3, 5, 3],
      [5, 1, 3]]) }),

    Ember.Object.create({ name: "tree", graph: newGraph([
      [7, 6],
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6]]) }),

    Ember.Object.create({ name: "grid", graph: newGraph([
      [9, 12],
      [0, 1],
      [1, 2],
      [0, 3],
      [1, 4],
      [2, 5],
      [3, 4],
      [4, 5],
      [3, 6],
      [4, 7],
      [5, 8],
      [6, 7],
      [7, 8]]) })
  ]),

  init: function() {
    this.set('current', this.get('examples')[0].get('graph'));
  }
});
