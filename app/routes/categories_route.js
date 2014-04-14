VisualAlgo.CategoriesRoute = Ember.Route.extend({
  model: function(params) {
    var store = params.category && params.category != "misc" ?
      VisualAlgo.RootAlgorithmStore.get(params.category) :
      VisualAlgo.RootAlgorithmStore;

    return store.get('algorithms').find(function(algo) {
      return algo.get('id') == params.id;
    });
  },

  afterModel: function(algo) {
    this.transitionTo('algorithms.' + algo.get('id'));
  },

  serialize: function(model) {
    return { id: model.get('id'), category: model.get('categories.0') || "misc"  };
  }
});
