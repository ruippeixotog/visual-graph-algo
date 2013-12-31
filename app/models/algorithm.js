VisualAlgo.Algorithm = Ember.Object.extend({

  name: "",
  inputView: Ember.View.extend({}),
  startAlgo: function(graph) {},
  
  init: function() {
    VisualAlgo.AlgorithmStore.get("algorithms").push(this);
  }
});
