require('app/routes/application_route');
require('app/routes/algorithm_route');

VisualAlgo.Router.map(function () {
  this.resource('algorithm', { path: '/:id' });
});
