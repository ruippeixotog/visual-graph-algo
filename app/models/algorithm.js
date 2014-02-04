VisualAlgo.Algorithm = Ember.Object.extend(VisualAlgo.AlgorithmEvents, {
  name: "",

  id: function() {
    return this.get('name').replace(" ", "-").toLowerCase();
  }.property('name'),

  domClass: function() {
    return "algo-" + this.get('id');
  }.property('id'),

  inputView: Ember.View.extend({}),

  startAlgo: function() {},

  // view-related functions; this should not be in the model
  reset: function() {},
  shouldRedraw: function() {
    return false;
  }.property(),
  
  init: function() {
    VisualAlgo.AlgorithmStore.get("algorithms").push(this);
  }
});
