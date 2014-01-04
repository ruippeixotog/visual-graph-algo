VisualAlgo.GraphView = Ember.ContainerView.extend({
  tagName: 'div',
  childViews: ['innerView'],

  // -------
  // graph to show (to be bound to a model/controller property)

  graph: null,

  // -------
  // graph data stored in a D3 handy way

  d3nodes: function() {
    return Ember.A([]);
  }.property(), // TODO: to depend on a property of graph once it exists

  d3links: function() {
    return Ember.A([]);
  }.property(), // TODO: to depend on a property of graph once it exists

  nextNodeId: 0,

  syncWithModel: function() {
    var graph = this.get('graph');
    var d3nodes = this.get('d3nodes');
    var d3links = this.get('d3links');

    d3nodes.clear();
    d3links.clear();
    this.set('nextNodeId', 0);

    var that = this;
    graph.foreachNode(function(id, nodeData) {
      if(Number(id) >= that.get('nextNodeId'))
        that.set('nextNodeId', Number(id) + 1);

      nodeData.id = id;
      nodeData.view = nodeData.view || {};
      d3nodes.push(nodeData);

      graph.foreachAdj(id, function(adj, edgeData) {
        if(!graph.isDirected() && id < adj) return;

        edgeData.source = nodeData;
        edgeData.target = graph.getNode(adj);
        edgeData.view = edgeData.view || {};
        d3links.push(edgeData);
      });
    });
  },

  // -------
  // D3 state

  selectedNode: null,
  selectedLink: null,
  mousedownLink: null,
  mousedownNode: null,
  mouseupNode: null,

  // -------
  // D3 view components

  svgWidth: 800,
  svgHeight: 600,

  svg: function() {
    d3.select("#graph-wrapper svg").remove();

    var svg = d3.select("#graph-wrapper")
      .append('svg')
      .attr('width', '100%')
      .attr('height', '70%') // TODO: make the graph occupy all available space
      .attr('viewBox', '0 0 ' + this.get('svgWidth') + ' ' + this.get('svgHeight'))
      .attr('preserveAspectRatio', 'xMidYMid');

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

    return svg;

  }.property('graph', 'svgWidth', 'svgHeight'),

  onSvgChange: function() {
    this.createView();
  }.observes('svg'),

  forceLayout: function() {
    return d3.layout.force()
      .nodes(this.get('d3nodes'))
      .links(this.get('d3links'))
      .size([this.get('svgWidth'), this.get('svgHeight')])
      .linkDistance(150)
      .charge(-500);
  }.property('d3nodes', 'd3links', 'svgWidth', 'svgHeight'),

  path: function() {
    return this.get('svg').append('svg:g').selectAll('path');
  }.property('svg'),

  circle: function() {
    return this.get('svg').append('svg:g').selectAll('g');
  }.property('svg'),

  createView: function() {
    var view = this;
    var svg = view.get('svg');

    // set up initial nodes and links
    this.syncWithModel();

    // init D3 force layout
    var force = view.get('forceLayout')
      .on('tick', tick);

    // line displayed when dragging new nodes
    var drag_line = svg.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    var path = this.get('path'),
        circle = this.get('circle');

    function resetMouseVars() {
      view.set('mousedownNode', null);
      view.set('mouseupNode', null);
      view.set('mousedownLink', null);
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
            targetPadding = view.get('graph').isDirected() ? 17 : 12,
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
    function updateViewLinks() {
      // path (link) group
      path = path.data(view.get('d3links'));

      // update existing links
      path
        .attr('class', function(d) { return $.merge(['link'], d.view.classes || []).join(' '); })
        .classed('selected', function(d) { return d === view.get('selectedLink'); })
        .style('marker-end', view.get('graph').isDirected() ? 'url(#end-arrow)' : '');


      // add new links
      path.enter().append('svg:path')
        .attr('class', function(d) {
          d.view = d.view || {};
          return $.merge(['link'], d.view.classes || []).join(' ');
        })
        .classed('selected', function(d) { return d === view.get('selectedLink'); })
        .style('marker-end', view.get('graph').isDirected() ? 'url(#end-arrow)' : '')
        .on('mousedown', function(d) {
          if(d3.event.ctrlKey) return;

          // select link
          view.set('mousedownLink', d);
          if(view.get('mousedownLink') === view.get('selectedLink')) this.set('selectedLink', null);
          else view.set('selectedLink', view.get('mousedownLink'));
          view.set('selectedNode', null);
          updateViewLinks();
          updateViewNodes();
        });

      // remove old links
      path.exit().remove();

      // set the graph in motion
      force.start();
    }

    // update graph (called when needed)
    function updateViewNodes() {

      // circle (node) group
      // NB: the function arg is crucial here! nodes are known by id, not by index!
      circle = circle.data(view.get('d3nodes'), function(d) { return d.id; });

      // update existing nodes (selected visual states)
      circle.selectAll('circle')
        .attr('class', function(d) { return $.merge(['node'], d.view.classes || []).join(' '); })
        .classed('selected', function(d) { return d === view.get('selectedNode'); });

      // add new nodes
      var g = circle.enter().append('svg:g');

      g.append('svg:circle')
        .attr('class', function(d) { d.view = {}; return $.merge(['node'], d.view.classes || []).join(' '); })
        .attr('r', 12)
        .classed('selected', function(d) { return d === view.get('selectedNode'); })
        .attr('data-nodeid', function(d) { return d.id; })
        .on('mouseover', function(d) {
          if(!view.get('mousedownNode') || d === view.get('mousedownNode')) return;
          // enlarge target node
          d3.select(this).attr('transform', 'scale(1.1)');
        })
        .on('mouseout', function(d) {
          if(!view.get('mousedownNode') || d === view.get('mousedownNode')) return;
          // unenlarge target node
          d3.select(this).attr('transform', '');
        })
        .on('mousedown', function(d) {
          if(d3.event.ctrlKey) return;

          // select node
          view.set('mousedownNode', d);
          if(view.get('mousedownNode') === view.get('selectedNode')) view.set('selectedNode', null);
          else view.set('selectedNode', view.get('mousedownNode'));
          view.set('selectedLink', null);

          // reposition drag line
          drag_line
            .style('marker-end', view.get('graph').isDirected() ? 'url(#end-arrow)' : '')
            .classed('hidden', false)
            .attr('d', 'M' + view.get('mousedownNode').x + ',' + view.get('mousedownNode').y +
              'L' + view.get('mousedownNode').x + ',' + view.get('mousedownNode').y);

          updateViewLinks();
          updateViewNodes();
        })
        .on('mouseup', function(d) {
          if(!view.get('mousedownNode')) return;

          // needed by FF
          drag_line
            .classed('hidden', true)
            .style('marker-end', '');

          // check for drag-to-self
          view.set('mouseupNode', d);
          if(view.get('mouseupNode') === view.get('mousedownNode')) { resetMouseVars(); return; }

          // unenlarge target node
          d3.select(this).attr('transform', '');

          // add link to graph (update if exists)
          // NB: links are strictly source < target; arrows separately specified by booleans
          var source = view.get('mousedownNode'),
            target = view.get('mouseupNode');

          var link = null;
          if(!view.get('graph').getEdge(source.id, target.id)) {
            link = view.get('graph').addEdge(source.id, target.id,
              { source: source, target: target });
            view.get('d3links').push(link);
          }

          // select new link
          view.set('selectedLink', link);
          view.set('selectedNode', null);
          updateViewLinks();
          updateViewNodes();
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

      if(d3.event.ctrlKey || view.get('mousedownNode') || view.get('mousedownLink')) return;

      // insert new node at point
      var point = d3.mouse(this),
          node = view.get('graph').addNode(view.get('nextNodeId'),
            { id: view.get('nextNodeId'), x: point[0], y: point[1] });
      view.get('d3nodes').push(node);

      view.set('nextNodeId', view.get('nextNodeId') + 1);
      updateViewNodes();
    }

    function mousemove() {
      if(!view.get('mousedownNode')) return;

      // update drag line
      drag_line.attr('d', 'M' + view.get('mousedownNode').x + ',' + view.get('mousedownNode').y +
        'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

      updateViewLinks();
    }

    function mouseup() {
      if(view.get('mousedownNode')) {
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
      var toSplice = view.get('d3links').filter(function(l) {
        return (l.source === node || l.target === node);
      });
      toSplice.map(function(l) {
        view.get('d3links').splice(view.get('d3links').indexOf(l), 1);
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

      if(!view.get('selectedNode') && !view.get('selectedLink')) return;
      switch(d3.event.keyCode) {
        case 8: // backspace
          d3.event.preventDefault();

        case 46: // delete
          if(view.get('selectedNode')) {
            view.get('d3nodes').splice(view.get('d3nodes').indexOf(view.get('selectedNode')), 1);
            spliceLinksForNode(view.get('selectedNode'));
            view.get('graph').removeNode(view.get('selectedNode').id);

            view.set('selectedNode', null);
            updateViewLinks();
            updateViewNodes();

          } else if(view.get('selectedLink')) {
            view.get('d3links').splice(view.get('d3links').indexOf(view.get('selectedLink')), 1);
            view.get('graph').removeEdge(
              view.get('selectedLink').source.id,
              view.get('selectedLink').target.id);

            view.set('selectedLink', null);
            updateViewLinks();
          }
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
    updateViewLinks();
    updateViewNodes();

    // hyper mega hack to expose the restart functions
    this.updateViewLinks = updateViewLinks;
    this.updateViewNodes = updateViewNodes;
  },

  redraw: function() {
    this.syncWithModel();
    this.updateViewLinks();
    this.updateViewNodes();

    if(this.get('shouldRedraw'))
      this.set('shouldRedraw', false);
  }.observes('shouldRedraw', 'graph.directed'),

  // -------
  // Ember related initialization

  innerView: Ember.View.extend({
    classNames: ['inner_graph_view'],
    elementId: 'graph-wrapper'
  }),

  didInsertElement: function() {
    this.createView();
  }
});
