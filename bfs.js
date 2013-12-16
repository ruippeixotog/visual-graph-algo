
function changeState(nodeid, from, to) {
  svg.selectAll('circle[data-nodeid="' + nodeid + '"]')
    .classed(from, false).classed(to, true);
}

function* bfs(src) {
  var found = new Array(graph.numNodes);
  for (var i = 0; i < graph.numNodes; i++)
    found[i] = false;

  var q = [];
  q.push(src); found[src] = true;

  while(q.length > 0) {
    var curr = q.shift();

    changeState(curr, "", "current");
    yield 0;
    changeState(curr, "current", "visited");

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
