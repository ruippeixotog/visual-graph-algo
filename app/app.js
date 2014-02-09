require('build/templates/templates');

VisualAlgo = Ember.Application.create({
  rootElement: '#visualalgoapp',
  LOG_TRANSITIONS: true
});

require('app/old/algoctl');

require('app/models/utils/union_find');

require('app/models/graph');
require('app/models/graph_store');
require('app/models/algorithm_store');
require('app/models/algorithm_events');
require('app/models/algorithm');
require('app/models/graph_algorithm');
require('app/models/traversal_algorithm');

require('app/models/bfs');
require('app/models/dfs');
require('app/models/kruskal');

require('app/controllers/algorithm_controller');

require('app/views/graph_view');

require('app/routes/router');
