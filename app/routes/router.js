require('app/routes/application_route');

VisualAlgo.Router.map(function () {
  this.resource('algorithm', { path: '/:algorithm_id' });
});
