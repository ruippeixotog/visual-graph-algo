
$(function() {
  $("#examples").change(function(value) {
    var newGraph = VisualAlgo.GraphStore.get('examples').find(
        function(e) { return e.name == $("#examples").val(); }).get('graph');

    VisualAlgo.GraphStore.set('current', newGraph);
  });

  $.each(VisualAlgo.GraphStore.get('examples'), function(i, obj) {
    $("#examples").append('<option value="' + obj.get('name') + '">' +
      obj.get('name') + '</option>');
  });

  $("#directed").change(function() {
    graphView.setDirected($(this).is(":checked"));
  });
});
