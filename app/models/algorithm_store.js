VisualAlgo.AlgorithmStore = Ember.Object.extend({

  add: function(algo) {
    if(algo.get('categories')) {
      algo.get('categories').forEach(function(cat) {
        var store = this.get(cat);
        if(!store) {
          store = VisualAlgo.AlgorithmStore.create();
          this.set(cat, store);
          this.get('categoryNames').pushObject(cat);
        }
        store.get('algorithms').pushObject(algo);
      }.bind(this));
    } else {
      this.get('algorithms').pushObject(algo);
    }

    VisualAlgo.Router.map(function () {
      this.resource('algorithms', function() {
        this.route(algo.get('id'));
      });
    });

    VisualAlgo['Algorithms' + algo.get('id').capitalize() + 'Route'] = Ember.Route.extend({
      model: function() { return algo; },

      setupController: function(controller, model) {
        controller.set('model', model);
        controller.set('controls.model', model);
      }
    });

    VisualAlgo['Algorithms' + algo.get('id').capitalize() + 'Controller'] = Ember.ObjectController.extend({
      needs: "algorithms",
      controlsBinding: 'controllers.algorithms'
    });
  },

  categoryNames: function() {
    return [];
  }.property(),

  algorithms: function() {
    return [];
  }.property(),

  categories: function() {
    return this.get('categoryNames').map(function(name) {
      return {
        name: name,
        algorithms: this.get(name).get('algorithms')
      }
    }.bind(this))
  }.property('categoryNames')
});

VisualAlgo.RootAlgorithmStore = VisualAlgo.AlgorithmStore.create();
