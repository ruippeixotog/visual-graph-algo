require('app/routes/application_route');
require('app/routes/categories_route');

VisualAlgo.Router.map(function () {
  this.resource('categories', { path: 'categories/:category/:id' });
});
