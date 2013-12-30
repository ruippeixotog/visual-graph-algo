require('dependencies/compiled/templates');

VisualAlgo = Ember.Application.create({
  rootElement: '#visualalgoapp',
  LOG_TRANSITIONS: true
});

require('app/old/graphdef');
require('app/old/graph');
require('app/old/visual_graph');
require('app/old/algoctl');
require('app/old/bfs');
require('app/old/dfs');
require('app/old/app');

require('app/routes/router');
