
function changeColor(nodeid, color) {
  $("circle[nodeid=" + nodeid + "]").css("fill", color);
}

function* bfs(src) {
  var found = new Array(graph.numNodes);
  for (var i = 0; i < graph.numNodes; i++)
    found[i] = false;

  var q = [];
  q.push(src); found[src] = true;

  while(q.length > 0) {
    var curr = q.shift();

    changeColor(curr, "red");
    yield 0;
    changeColor(curr, "#666666");

    graph.adjs[curr].forEach(function(adj) {
      if(!found[adj]) {
        q.push(adj); found[adj] = true;
      }
    });
  }
}

var algo;
var finished = false;

$(function() {
  $("#start").click(function() {
    var startAt = Number($("#startAt").val());
    algo = bfs(startAt);
  });

  $("#next").click(function() {
    if(finished) return;

    var e = algo.next();
    if(e.value) alert(e.value);
    finished = e.done;
    if(finished) alert("Finished!");
  });
});
