VisualAlgo.Algorithm = Ember.Object.extend({
  name: "",
  inputView: Ember.View.extend({}),

  startAlgo: function() {},

  // view-related functions; this should not be in the model
  reset: function() {},
  shouldRedraw: function() {
    return false;
  },
  
  init: function() {
    VisualAlgo.AlgorithmStore.get("algorithms").push(this);
  }
});
