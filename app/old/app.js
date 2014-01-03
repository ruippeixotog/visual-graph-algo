
$(function() {
  $("#directed").change(function() {
    graphView.setDirected($(this).is(":checked"));
  });
});
