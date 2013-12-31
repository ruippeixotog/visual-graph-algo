
ctl = {
  step: function() { return { step: true }; },

  view: function(func) {
    return { step: false, view: func };
  }
};
