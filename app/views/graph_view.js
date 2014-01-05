VisualAlgo.GraphView = Ember.ContainerView.extend({
  tagName: 'div',
  childViews: ['innerView'],
  graph: null,

  svg: null,
  d3graph: null,

  createView: function() {
    var that = this;

    // set up SVG for D3
    var width  = 800,
        height = 600;

    var svg = (that.get('svg') || d3.select("#graph-wrapper"))
      .append('svg')
      .attr('width', '100%')
      .attr('height', '70%') // TODO make the graph occupy all available space
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('preserveAspectRatio', 'xMidYMid');

    that.set('svg', svg);

    // set up initial nodes and links
    var d3graph = {
      nodes: [],
      links: [],
      nextId: 0
    };

    that.set('d3graph', d3graph);
    this.syncWithModel();

    // init D3 force layout
    var force = d3.layout.force()
        .nodes(d3graph.nodes)
        .links(d3graph.links)
        .size([width, height])
        .linkDistance(150)
        .charge(-500)
        .on('tick', tick)

    // define arrow markers for graph links
    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#000');

    // line displayed when dragging new nodes
    var drag_line = svg.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    var path = svg.append('svg:g').selectAll('path'),
        circle = svg.append('svg:g').selectAll('g');

    // mouse event vars
    var selected_node = null,
        selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mouseup_node = null;

    function resetMouseVars() {
      mousedown_node = null;
      mouseup_node = null;
      mousedown_link = null;
    }

    // update force layout (called automatically each iteration)
    function tick() {
      // draw directed edges with proper padding from node centers
      path.attr('d', function(d) {
        var deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            sourcePadding = 12,
            targetPadding = that.get('graph').isDirected() ? 17 : 12,
            sourceX = d.source.x + (sourcePadding * normX),
            sourceY = d.source.y + (sourcePadding * normY),
            targetX = d.target.x - (targetPadding * normX),
            targetY = d.target.y - (targetPadding * normY);
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
      });

      circle.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    }

    // update graph (called when needed)
    function restart() {
      // path (link) group
      path = path.data(d3graph.links);

      // update existing links
      path
        .attr('class', function(d) { return $.merge(['link'], d.view.classes || []).join(' '); })
        .classed('selected', function(d) { return d === selected_link; })
        .style('marker-end', that.get('graph').isDirected() ? 'url(#end-arrow)' : '');


      // add new links
      path.enter().append('svg:path')
        .attr('class', function(d) {
          d.view = d.view || {};
          return $.merge(['link'], d.view.classes || []).join(' ');
        })
        .classed('selected', function(d) { return d === selected_link; })
        .style('marker-end', that.get('graph').isDirected() ? 'url(#end-arrow)' : '')
        .on('mousedown', function(d) {
          if(d3.event.ctrlKey) return;

          // select link
          mousedown_link = d;
          if(mousedown_link === selected_link) selected_link = null;
          else selected_link = mousedown_link;
          selected_node = null;
          restart();
        });

      // remove old links
      path.exit().remove();


      // circle (node) group
      // NB: the function arg is crucial here! nodes are known by id, not by index!
      circle = circle.data(d3graph.nodes, function(d) { return d.id; });

      // update existing nodes (selected visual states)
      circle.selectAll('circle')
        .attr('class', function(d) { return $.merge(['node'], d.view.classes || []).join(' '); })
        .classed('selected', function(d) { return d === selected_node; });

      // add new nodes
      var g = circle.enter().append('svg:g');

      g.append('svg:circle')
        .attr('class', function(d) { d.view = {}; return $.merge(['node'], d.view.classes || []).join(' '); })
        .attr('r', 12)
        .classed('selected', function(d) { return d === selected_node; })
        .attr('data-nodeid', function(d) { return d.id; })
        .on('mouseover', function(d) {
          if(!mousedown_node || d === mousedown_node) return;
          // enlarge target node
          d3.select(this).attr('transform', 'scale(1.1)');
        })
        .on('mouseout', function(d) {
          if(!mousedown_node || d === mousedown_node) return;
          // unenlarge target node
          d3.select(this).attr('transform', '');
        })
        .on('mousedown', function(d) {
          if(d3.event.ctrlKey) return;

          // select node
          mousedown_node = d;
          if(mousedown_node === selected_node) selected_node = null;
          else selected_node = mousedown_node;
          selected_link = null;

          // reposition drag line
          drag_line
            .style('marker-end', that.get('graph').isDirected() ? 'url(#end-arrow)' : '')
            .classed('hidden', false)
            .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

          restart();
        })
        .on('mouseup', function(d) {
          if(!mousedown_node) return;

          // needed by FF
          drag_line
            .classed('hidden', true)
            .style('marker-end', '');

          // check for drag-to-self
          mouseup_node = d;
          if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

          // unenlarge target node
          d3.select(this).attr('transform', '');

          // add link to graph (update if exists)
          // NB: links are strictly source < target; arrows separately specified by booleans
          var source = mousedown_node,
              target = mouseup_node;

          var link = null;
          if(!that.get('graph').getEdge(source.id, target.id)) {
            link = that.get('graph').addEdge(source.id, target.id,
              { source: source, target: target });
            d3graph.links.push(link);
          }

          // select new link
          selected_link = link;
          selected_node = null;
          restart();
        });

      // show node IDs
      g.append('svg:text')
          .attr('x', 0)
          .attr('y', 4)
          .attr('class', 'id')
          .text(function(d) { return d.id; });

      // remove old nodes
      circle.exit().remove();

      // set the graph in motion
      force.start();
    }

    function mousedown() {
      // prevent I-bar on drag
      //d3.event.preventDefault();

      // because :active only works in WebKit?
      svg.classed('active', true);

      if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

      // insert new node at point
      var point = d3.mouse(this),
          node = that.get('graph').addNode(d3graph.nextId,
            { id: d3graph.nextId, x: point[0], y: point[1] });
      d3graph.nodes.push(node);

      d3graph.nextId++;
      restart();
    }

    function mousemove() {
      if(!mousedown_node) return;

      // update drag line
      drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

      restart();
    }

    function mouseup() {
      if(mousedown_node) {
        // hide drag line
        drag_line
          .classed('hidden', true)
          .style('marker-end', '');
      }

      // because :active only works in WebKit?
      svg.classed('active', false);

      // clear mouse event vars
      resetMouseVars();
    }

    function spliceLinksForNode(node) {
      var toSplice = d3graph.links.filter(function(l) {
        return (l.source === node || l.target === node);
      });
      toSplice.map(function(l) {
        d3graph.links.splice(d3graph.links.indexOf(l), 1);
      });
    }

    // only respond once per keydown
    var lastKeyDown = -1;

    function keydown() {
      // d3.event.preventDefault();

      if(lastKeyDown !== -1) return;
      lastKeyDown = d3.event.keyCode;

      // ctrl
      if(d3.event.keyCode === 17) {
        circle.call(force.drag);
        svg.classed('ctrl', true);
      }

      if(!selected_node && !selected_link) return;
      switch(d3.event.keyCode) {
        case 8: // backspace
          d3.event.preventDefault();

        case 46: // delete
          if(selected_node) {
            d3graph.nodes.splice(d3graph.nodes.indexOf(selected_node), 1);
            spliceLinksForNode(selected_node);
            that.get('graph').removeNode(selected_node.id);

          } else if(selected_link) {
            d3graph.links.splice(d3graph.links.indexOf(selected_link), 1);
            that.get('graph').removeEdge(
              selected_link.source.id,
              selected_link.target.id);
          }
          selected_link = null;
          selected_node = null;
          restart();
          break;
      }
    }

    function keyup() {
      lastKeyDown = -1;

      // ctrl
      if(d3.event.keyCode === 17) {
        circle
          .on('mousedown.drag', null)
          .on('touchstart.drag', null);
        svg.classed('ctrl', false);
      }
    }

    // app starts here
    svg.on('mousedown', mousedown)
      .on('mousemove', mousemove)
      .on('mouseup', mouseup);
    d3.select(window)
      .on('keydown', keydown)
      .on('keyup', keyup);
    restart();

    // hyper mega hack to expose the restart function
    this.restart = restart;
  },

  syncWithModel: function() {
    var graph = this.get('graph');
    var d3graph = this.get('d3graph');

    d3graph.nodes.length = 0;
    d3graph.links.length = 0;

    var that = this;
    graph.foreachNode(function(id, nodeData) {
      d3graph.nextId = Math.max(d3graph.nextId, Number(id) + 1);

      nodeData.id = id;
      nodeData.view = nodeData.view || {};
      d3graph.nodes.push(nodeData);

      graph.foreachAdj(id, function(adj, edgeData) {
        if(!graph.isDirected() && id < adj) return;

        edgeData.source = nodeData;
        edgeData.target = graph.getNode(adj);
        edgeData.view = edgeData.view || {};
        d3graph.links.push(edgeData);
      });
    });
  },

  redraw: function() {
    this.syncWithModel();
    this.restart();

    if(this.get('shouldRedraw'))
      this.set('shouldRedraw', false);
  }.observes('shouldRedraw', 'graph.directed'),

  onGraphChange: function() {
    this.get('svg').remove();
    this.set('svg', null);
    this.createView();
  }.observes('graph'),

  innerView: Ember.View.extend({
    classNames: ['inner_graph_view'],
    elementId: 'graph-wrapper'
  }),

  didInsertElement: function() {
    this.createView();
  }
});
