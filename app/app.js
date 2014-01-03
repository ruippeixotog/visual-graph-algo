require('dependencies/compiled/templates');

VisualAlgo = Ember.Application.create({
  rootElement: '#visualalgoapp',
  LOG_TRANSITIONS: true
});

require('app/old/graph');
require('app/old/algoctl');
require('app/old/app');

require('app/models/graph_store');
require('app/models/algorithm_store');
require('app/models/algorithm');
require('app/models/traversal_algorithm');
require('app/models/bfs');
require('app/models/dfs');

require('app/controllers/algorithm_controller');

require('app/views/graph_view');

require('app/routes/router');
