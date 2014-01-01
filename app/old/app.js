
$(function() {
  $("#examples").change(function(value) {
    VisualAlgo.Global.set('graph', newGraph(graphDefs[$("#examples").val()]));
  });

  $.each(graphDefs, function(name, def) {
    $("#examples").append('<option value="' + name + '">' + name + '</option>');
  });

  $("#directed").change(function() {
    graphView.setDirected($(this).is(":checked"));
  });
});
