
var algo, finished;

$(function() {
  $("#start").click(function() {
    var startAt = Number($("#startAt").val());
    algo = bfs(startAt);

    finished = false;
    resetState();

    $("#next").click();
  });

  $("#next").click(function() {
    if(finished) return;

    var e = algo.next();
    if(e.value) alert(e.value);
    finished = e.done;
    if(finished) alert("Finished!");
  });

  $("directed").change(function() {
    
  });
});
