VisualAlgo.Algorithm = Ember.Object.extend(VisualAlgo.AlgorithmEvents, {
  name: "",
  categories: null,

  id: function() {
    return this.get('name').replace(" ", "-").toLowerCase();
  }.property('name'),

  domClass: function() {
    return "algo-" + this.get('id');
  }.property('id'),

  startAlgo: function() {},

  // view-related functions; this should not be in the model
  reset: function() {},

  shouldRedraw: function() {
    return false;
  }.property(),
  
  init: function() {
    VisualAlgo.RootAlgorithmStore.add(this);
  }
});
