VisualAlgo.Algorithm = Ember.Object.extend({

  // --- to implement ---
  id: function() {
    return this.get("name");
  }.property("name"),

  name: "",
  inputView: Ember.View.extend({}),
  startAlgo: function(graph) {},

  // --- internals ---
  init: function() {
    VisualAlgo.AlgorithmStore.get("algorithms").push(this);
  }
});
