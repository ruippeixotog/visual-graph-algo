VisualAlgo.AlgorithmController = Ember.ObjectController.extend(Ember.TargetActionSupport, {
  algoState: null,
  finished: false,

  actions: {
    start: function() {
      this.set('algoState', this.get('model').startAlgo(graph));
      this.set('finished', false);
      graphView.resetNodes();

      this.triggerAction({ action: 'next', target: this });
    },

    next: function() {
      if(this.get('finished')) return;

      var step = false;
      while(!this.get('finished') && !step) {
        var e = this.get('algoState').next();
        if(e.value) {
          step = e.value.step;
          if(e.value.view) e.value.view(graphView);
        }
        this.set('finished', e.done);
      }

      if(this.get('finished')) alert('Finished!');
    }
  }
});
