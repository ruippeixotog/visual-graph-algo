VisualAlgo.AlgorithmsController = Ember.ObjectController.extend(Ember.TargetActionSupport, {
  algoState: null,
  finished: false,

  alertFinished: function() {
    if(this.get('finished')) alert("Finished!");
  }.observes('finished'),

  actions: {
    reset: function() {
      this.get('model').reset();
      this.set('algoState', null);
      this.set('finished', false);
      this.set('model.shouldRedraw', true);
    },

    start: function() {
      this.get('model').reset();

      this.set('algoState', this.get('model').startAlgo());
      this.set('finished', false);

      this.triggerAction({ action: 'next', target: this });
    },

    next: function() {
      if(this.get('finished')) { alert("Already finished!"); return; }
      else if(!this.get('algoState')) { alert("Not yet started!"); return; }

      var step = false;
      while(!this.get('finished') && !step) {
        var e = this.get('algoState').next();
        if(e.value) {
          step = e.value.step;
        }
        this.set('finished', e.done);
      }
      this.set('model.shouldRedraw', true);
    }
  }
});
