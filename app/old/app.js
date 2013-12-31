
$(function() {
  graph = newGraph(graphDefs["default"]);
  graphView = newGraphView('#graph-wrapper', graph);

  $("#examples").change(function(value) {
    graph = newGraph(graphDefs[$("#examples").val()]);
    graphView.setGraph(graph);
  });

  $.each(graphDefs, function(name, def) {
    $("#examples").append('<option value="' + name + '">' + name + '</option>');
  });

  $("#directed").change(function() {
    graphView.setDirected($(this).is(":checked"));
  });
});
