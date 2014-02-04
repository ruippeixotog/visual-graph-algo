VisualAlgo.AlgorithmRoute = Ember.Route.extend({
  model: function(params) {
    return VisualAlgo.AlgorithmStore.get('algorithms').find(function(algo) {
      return algo.get('id') == params.id;
    });
  },

  serialize: function(model) {
    return { id: model.get('id') };
  }
});
