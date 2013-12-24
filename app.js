
$(function() {
  var graph = newGraph(graphDefs["default"]);
  var graphView = newGraphView('#graph-wrapper', graph);

  $("#examples").change(function(value) {
    graph = newGraph(graphDefs[$("#examples").val()]);
    graphView.setGraph(graph);
  });

  $.each(graphDefs, function(name, def) {
    $("#examples").append('<option value="' + name + '">' + name + '</option>');
  });

  $("#bfs-opt").click(function() {
    $(".algo-input").hide();
    $("#bfs-input").show();
  });

  $("#dfs-opt").click(function() {
    $(".algo-input").hide();
    $("#dfs-input").show();
  });

  $("#directed").change(function() {
    graphView.setDirected($(this).is(":checked"));
  });

  var algo, finished;

  $("#bfs-start").click(function() {
    var startAt = Number($("#bfs-start-at").val());
    algo = bfs(graph, startAt);

    finished = false;
    graphView.resetNodes();

    $(".algo-next").first().click();
  });

  $("#dfs-start").click(function() {
    var startAt = Number($("#dfs-start-at").val());
    algo = dfs(graph, startAt);

    finished = false;
    graphView.resetNodes();

    $(".algo-next").first().click();
  });

  $(".algo-next").click(function() {
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
});
