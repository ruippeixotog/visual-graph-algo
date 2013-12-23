
$(function() {
  var graph = newGraph(graphDefs["default"]);
  var graphView = newGraphView('body', graph);

  var algo, finished;

  $("#start").click(function() {
    var startAt = Number($("#startAt").val());
    algo = bfs(graph, startAt);

    finished = false;
    graphView.resetNodes();

    $("#next").click();
  });

  $("#next").click(function() {
    if(finished) return;

    var step = false;
    while(!finished && !step) {
      var e = algo.next();
      if(e.value) {
        step = e.value.step;
        if(e.value.view) e.value.view(graphView);
      }
      finished = e.done;
    }

    if(finished) alert("Finished!");
  });

  $("#directed").change(function() {
    graphView.setDirected($(this).is(":checked"));
  });

  $.each(graphDefs, function(name, def) {
    $("#examples").append('<option value="' + name + '">' + name + '</option>');
  });

  $("#examples").change(function(value) {
    graph = newGraph(graphDefs[$("#examples").val()]);
    graphView.setGraph(graph);
  });
});
