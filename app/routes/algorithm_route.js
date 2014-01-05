VisualAlgo.AlgorithmRoute = Ember.Route.extend({
  model: function(params) {
    return VisualAlgo.AlgorithmStore.get('algorithms').find(function(algo) {
      return algo.get('name') == params.name;
    });
  },

  serialize: function(model) {
    return { name: model.get('name') };
  }
});
