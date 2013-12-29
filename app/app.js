require('dependencies/compiled/templates');

VisualAlgo = Ember.Application.create({
  rootElement: '#visualalgoapp',
  LOG_TRANSITIONS: true
});

require('app/models/graphdef');
require('app/models/graph');
require('app/models/visual_graph');
require('app/models/algoctl');
require('app/models/bfs');
require('app/models/dfs');
require('app/models/app');

require('app/routes/router');
