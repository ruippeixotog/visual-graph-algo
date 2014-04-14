VisualAlgo.GraphView = Ember.ContainerView.extend({
  tagName: 'div',
  childViews: ['innerView'],

  // -------
  // graph to show (to be bound to a model/controller property)

  graph: null,

  showNodeValues: false,
  showEdgeValues: false,
  disableEditingBinding: 'controller.controls.algoState',

  // -------
  // graph data stored in a D3 handy way

  d3nodes: [], // TODO: to depend on an observable property of graph once it exists
  d3links: [], // TODO: to depend on an observable property of graph once it exists
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
      d3nodes.pushObject(nodeData);

      graph.foreachAdj(id, function(adj, edgeData) {
        if(!graph.isDirected() && id < adj) return;

        edgeData.source = nodeData;
        edgeData.target = graph.getNode(adj);
        edgeData.view = edgeData.view || {};
        d3links.pushObject(edgeData);
      });
    });
  },

  // -------
  // D3 mouse and selection state

  selectedNode: null,
  selectedLink: null,
  mousedownLink: null,
  mousedownNode: null,
  mouseupNode: null,

  dragLine: function() {
    return this.get('svg')
      .append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');
  }.property('svg'),

  resetMouseVars: function() {
    this.set('mousedownNode', null);
    this.set('mouseupNode', null);
    this.set('mousedownLink', null);
  },

  onEditingDisabled: function() {
    this.resetMouseVars();
    this.set('selectedNode', null);
    this.set('selectedLink', null);
  }.observes('disableEditing'),

  // -------
  // D3 view components

  svgWidth: function() {
    return Math.max(200, Math.min(800, this.$().width()));
  }.property(),

  svgHeight: function() {
    return Math.max(150, Math.min(600, this.$().height()));
  }.property(),

  svg: function() {
    d3.select("#graph-wrapper svg").remove();

    var svg = d3.select("#graph-wrapper")
      .append('svg')
      .attr('class', 'graph')
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

  }.property('graph'),

  onSvgResize: function() {
    this.get('svg').attr('viewBox', '0 0 ' + this.get('svgWidth') + ' ' + this.get('svgHeight'));
  }.observes('svgWidth', 'svgHeight'),

  linkDistance: function() {
    return Math.max(75, this.get('svgWidth') * 0.1875);
  }.property('svgWidth'),

  nodeCharge: function() {
    return -this.get('svgWidth') * 0.625;
  }.property('svgWidth'),

  forceLayout: function() {
    return d3.layout.force()
      .nodes(this.get('d3nodes'))
      .links(this.get('d3links'))
      .size([this.get('svgWidth'), this.get('svgHeight')])
      .linkDistance(this.get('linkDistance'))
      .charge(this.get('nodeCharge'))
      .on('tick', this.get('tickFunc'));
  }.property('d3nodes', 'd3links', 'svgWidth', 'svgHeight', 'linkDistance', 'nodeCharge'),

  // -------
  // D3 node drawing

  svgBaseNodes: function() {
    return this.get('svg').append('svg:g').selectAll('g');
  }.property('svg'),

  svgNodes: function() {
    return this.get('svgBaseNodes');
  }.property(),

  updateNodesInSvg: function() {
    var view = this;
    var svgNodes = view.get('svgNodes');

    // update existing nodes (selected visual states)
    svgNodes.selectAll('circle')
      .attr('class', function(d) {
        d.view = d.view || {};
        return $.merge(['node'], d.view.classes || []).join(' ');
      })
      .attr('style', function(d) { return d.view.style; })
      .classed('selected', function(d) { return d === view.get('selectedNode'); });

    svgNodes.selectAll('.node-label')
      .style('display', view.get('showNodeValues') ? 'block' : 'none');

  }.observes('selectedNode', 'showNodeValues'),

  addRemoveNodesInSvg: function() {
    var view = this;
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    var svgNodes = view.get('svgNodes').data(view.get('d3nodes'), function(d) { return d.id; });
    this.set('svgNodes', svgNodes);

    // add new nodes
    var g = svgNodes.enter().append('svg:g');

    // --- events for the circle elements ---

    function mousedown(d) {
      if(d3.event.ctrlKey || view.get('disableEditing')) return;
      view.set('mousedownNode', d);

      // select/unselect the node and possibly unselect any selected link
      if(view.get('mousedownNode') === view.get('selectedNode')) view.set('selectedNode', null);
      else view.set('selectedNode', view.get('mousedownNode'));
      view.set('selectedLink', null);

      // show and initialize the position of the drag line
      view.get('dragLine')
        .style('marker-end', view.get('graph').isDirected() ? 'url(#end-arrow)' : '')
        .classed('hidden', false)
        .attr('d', 'M' + view.get('mousedownNode').x + ',' + view.get('mousedownNode').y +
          'L' + view.get('mousedownNode').x + ',' + view.get('mousedownNode').y);
    }

    function mouseup(d) {
      if(!view.get('mousedownNode')) return;
      view.set('mouseupNode', d);

      // hide the drag line, if applicable
      view.get('dragLine')
        .classed('hidden', true)
        .style('marker-end', '');

      // check for a drag-to-self action
      if(view.get('mouseupNode') === view.get('mousedownNode')) {
        view.resetMouseVars();
        return;
      }

      // unenlarge target node, if applicable
      d3.select(this).attr('transform', '');

      // add link to graph if it not exists already
      var source = view.get('mousedownNode'),
        target = view.get('mouseupNode');

      var link = null;
      if(!view.get('graph').getEdge(source.id, target.id)) {
        link = view.get('graph').addEdge(source.id, target.id, { source: source, target: target });
        view.get('d3links').pushObject(link);
      }

      // select the new link
      view.set('selectedLink', link);
      view.set('selectedNode', null);
    }

    function mouseover(d) {
      if(!view.get('mousedownNode') || d === view.get('mousedownNode')) return;

      // if a mousedown node is defined and it's not the current one (i.e. a drag is happening),
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    }

    function mouseout(d) {
      if(!view.get('mousedownNode') || d === view.get('mousedownNode')) return;

      // if a mousedown node is defined and it's not the current one (i.e. a drag is happening),
      // unenlarge target node
      d3.select(this).attr('transform', '');
    }

    function touchstart(d) {
      d3.event.preventDefault();

      // do the normal mousedown actions
      mousedown.bind(this)(d);

      // create an object representing the state of this touch start
      var touchState = { ended: false, moved: false };
      view.set('touchState', touchState);

      // schedule a check for 750ms later in order to verify if this is a long touch
      setTimeout(function() {

        // if there wasn't a touchend event and the touch hasn't moved outside this node,
        // remove the node
        if(!touchState.ended && !touchState.moved)
          view.removeSelected();
      }, 750);
    }

    function touchend(d) {
      d3.event.preventDefault();

      // WARNING: unlike the mouseup event, which is triggered on the element in which the mouse
      // button was released, the touchend event is always triggered on the starting element

      // get the element in which the touch ended
      var touch = d3.event.changedTouches[0];
      var elem = document.elementFromPoint(touch.pageX, touch.pageY);

      // if it is a circle element, do the normal mouseup actions on the target node
      if(elem.tagName === 'circle') {
        mouseup.bind(this)(d3.select(elem).datum());

      } else {
        if(view.get('mousedownNode')) {

          // hide drag line
          view.get('dragLine')
            .classed('hidden', true)
            .style('marker-end', '');
        }

        // because :active only works in WebKit?
        view.get('svg').classed('active', false);

        // clear mouse event vars
        view.resetMouseVars();
      }

      // set the ended flag for the current touch state object and set the current state to null
      // (the touchstart scheduled timeout will still act on the former object)
      view.get('touchState').ended = true;
      view.set('touchState', null);
    }

    // --- ---

    g.append('svg:circle')
      .attr('r', 12)
      .attr('class', function(d) {
        d.view = d.view || {};
        return $.merge(['node'], d.view.classes || []).join(' ');
      })
      .attr('style', function(d) { return d.view.style; })
      .classed('selected', function(d) { return d === view.get('selectedNode'); })
      .attr('data-nodeid', function(d) { return d.id; })
      .on('mousedown', mousedown)
      .on('mouseup', mouseup)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('touchstart', touchstart)
      .on('touchend', touchend);

    // show node IDs
    g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.id; });

    // show node value inputs/labels
    var labels = g.append('svg:g')
      .attr('class', 'svg-label node-label')
      .style('display', view.get('showNodeValues') ? 'block' : 'none')
      .append('svg:foreignObject')
      .attr('width', 55)
      .attr('height', 40);

    labels.append('xhtml:p')
      .html(function(d) { return d.value || 1; });

    labels.append('xhtml:input')
      .attr('type', 'text')
      .attr('class', 'form-control')
      .attr('value', function(d) { return d.value || 1; })
      .on('mousedown', function(d) { d3.event.ignore = true; })
      .on('keydown', function() { d3.event.ignore = true; })
      .on('change', function(d, i) {
        d.value = Number(this.value);
        labels.selectAll('p').html(function(d) { return d.value || 1; });
      });

    // remove old nodes
    svgNodes.exit().remove();

    // set the graph in motion
    this.get('forceLayout').start();

  }.observes('d3nodes.@each'),

  // -------
  // D3 link drawing

  svgBaseLinks: function() {
    return this.get('svg').append('svg:g').selectAll('path');
  }.property('svg'),

  svgLinks: function() {
    return this.get('svgBaseLinks');
  }.property(),

  svgBaseLinkLabels: function() {
    return this.get('svg').append('svg:g').selectAll('foreignobject');
  }.property('svg'),

  svgLinkLabels: function() {
    return this.get('svgBaseLinkLabels');
  }.property(),

  updateLinksInSvg: function() {
    var view = this;
    var svgLinks = view.get('svgLinks');
    var svgLinkLabels = view.get('svgLinkLabels');

    // update existing links
    svgLinks
      .attr('class', function(d) {
        d.view = d.view || {};
        return $.merge(['link'], d.view.classes || []).join(' ');
      })
      .attr('style', function(d) { return d.view.style; })
      .classed('selected', function(d) { return d === view.get('selectedLink'); })
      .style('marker-end', view.get('graph').isDirected() ? 'url(#end-arrow)' : '');

    svgLinkLabels
      .style('display', view.get('showEdgeValues') ? "block" : "none")
      .classed('selected', function(d) { return d === view.get('selectedLink'); });

  }.observes('selectedLink', 'showEdgeValues'),

  addRemoveLinksInSvg: function() {
    var view = this;
    var svgLinks = view.get('svgLinks').data(view.get('d3links'));
    this.set('svgLinks', svgLinks);

    // add new links
    svgLinks.enter().append('svg:path')
      .attr('class', function(d) {
        d.view = d.view || {};
        return $.merge(['link'], d.view.classes || []).join(' ');
      })
      .attr('style', function(d) { return d.view.style; })
      .classed('selected', function(d) { return d === view.get('selectedLink'); })
      .style('marker-end', view.get('graph').isDirected() ? 'url(#end-arrow)' : '')
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey || view.get('disableEditing')) return;

        // select link
        view.set('mousedownLink', d);
        if(view.get('mousedownLink') === view.get('selectedLink')) view.set('selectedLink', null);
        else view.set('selectedLink', view.get('mousedownLink'));
        view.set('selectedNode', null);
      });

    // remove old links
    svgLinks.exit().remove();

    // add new link labels
    var svgLinkLabels = view.get('svgLinkLabels').data(view.get('d3links'),
      function(d) { return d.source.id + " " + d.target.id; });

    this.set('svgLinkLabels', svgLinkLabels);

    // show node value inputs/labels
    var labels = svgLinkLabels.enter().append('svg:foreignObject')
      .attr('class', 'svg-label edge-label')
      .style('display', view.get('showEdgeValues') ? "block" : "none")
      .classed('selected', function(d) { return d === view.get('selectedLink') })
      .attr('width', 55)
      .attr('height', 40);

    labels.append('xhtml:p')
      .html(function(d) { return d.value || 1; });

    labels.append('xhtml:input')
      .attr('type', 'text')
      .attr('class', 'form-control')
      .attr('value', function(d) {
        return d.value || 1;
      })
      .on('mousedown', function(d) {
        d3.event.ignore = true;
      })
      .on('keydown', function() {
        d3.event.ignore = true;
      })
      .on('change', function(d, i) {
        d.value = Number(this.value);
        labels.selectAll('p').html(function(d) { return d.value || 1; });
      });

    // remove old link labels
    svgLinkLabels.exit().remove();

    // set the graph in motion
    view.get('forceLayout').start();

  }.observes('d3links.@each'),

  // -------
  // graph view actions

  removeSelected: function() {
    var view = this;

    function removeLinksForNode(node) {
      var toSplice = view.get('d3links').filter(function(l) {
        return (l.source === node || l.target === node);
      });
      toSplice.map(function(l) {
        view.get('d3links').replace(view.get('d3links').indexOf(l), 1);
      });
    }

    if(view.get('selectedNode')) {
      view.get('d3nodes').replace(view.get('d3nodes').indexOf(view.get('selectedNode')), 1);
      removeLinksForNode(view.get('selectedNode'));
      view.get('graph').removeNode(view.get('selectedNode').id);

      view.set('selectedNode', null);

    } else if(view.get('selectedLink')) {
      view.get('d3links').replace(view.get('d3links').indexOf(view.get('selectedLink')), 1);
      view.get('graph').removeEdge(
        view.get('selectedLink').source.id,
        view.get('selectedLink').target.id);

      view.set('selectedLink', null);
    }
  },

  // -------
  // D3 initialization

  tickFunc: function() {
    var view = this;
    var lastTick = 0;

    function tickAlive() {
      if(new Date().getTime() > lastTick + 250) tick();
      setTimeout(tickAlive, 300);
    }
    tickAlive(); // WTF hack to keep the SVG inputs active

    function tick() {
      var graph = view.get('graph');

      // draw directed edges with proper padding from node centers
      view.get('svgLinks').attr('d', function(d) {
        var deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = 12,
          targetPadding = graph.isDirected() ? 17 : 12,
          sourceX = d.source.x + (sourcePadding * normX),
          sourceY = d.source.y + (sourcePadding * normY),
          targetX = d.target.x - (targetPadding * normX),
          targetY = d.target.y - (targetPadding * normY),
          midpointX = (targetX + sourceX) / 2,
          midpointY = (targetY + sourceY) / 2,
          ctrlDeviation = dist / 5,
          labelDeviation = 10;

        var pathDef = 'L';
        if(graph.isDirected() && graph.getEdge(d.target.id, d.source.id)) {
          labelDeviation = dist / 5;
          pathDef = 'Q' + (midpointX - normY * ctrlDeviation) +
            ',' + (midpointY + normX * ctrlDeviation) + ',';
        }

        d.view.labelX = midpointX - normY * labelDeviation;
        d.view.labelY = midpointY + normX * labelDeviation;

        return 'M' + sourceX + ',' + sourceY + pathDef + targetX + ',' + targetY;
      });

      if(view.get('showEdgeValues')) {
        view.get('svgLinkLabels')
          .attr('x', function(d) { return d.view.labelX - 25; })
          .attr('y', function(d) { return d.view.labelY - 17; });
      }

      view.get('svgNodes').attr('transform', function(d) {
        return d.x && d.y ? 'translate(' + d.x + ',' + d.y + ')' : null;
      });

      lastTick = new Date().getTime();
    }

    return tick;
  }.property(),

  createView: function() {
    var view = this;
    var svg = view.get('svg');

    // set up initial nodes and links
    this.syncWithModel();

    function mousedown() {
      if(d3.event.ignore || view.get('disableEditing')) return;
      // prevent I-bar on drag
      //d3.event.preventDefault();

      // because :active only works in WebKit?
      svg.classed('active', true);

      if(d3.event.ctrlKey || view.get('mousedownNode') || view.get('mousedownLink')) return;

      // insert new node at point
      var point = d3.mouse(this),
        node = view.get('graph').addNode(view.get('nextNodeId'),
          { id: view.get('nextNodeId'), x: point[0], y: point[1] });
      view.get('d3nodes').pushObject(node);

      view.set('nextNodeId', view.get('nextNodeId') + 1);
    }

    function mousemove() {
      if(!view.get('mousedownNode')) return;

      // update drag line
      view.get('dragLine')
        .attr('d', 'M' + view.get('mousedownNode').x + ',' + view.get('mousedownNode').y +
          'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    }

    function mouseup() {
      if(view.get('mousedownNode')) {
        // hide drag line
        view.get('dragLine')
          .classed('hidden', true)
          .style('marker-end', '');
      }

      // because :active only works in WebKit?
      svg.classed('active', false);

      // clear mouse event vars
      view.resetMouseVars();
    }

    // only respond once per keydown
    var lastKeyDown = -1;

    function keydown() {
      if(d3.event.ignore) return;
      // d3.event.preventDefault();

      if(lastKeyDown !== -1) return;
      lastKeyDown = d3.event.keyCode;

      // ctrl
      if(d3.event.keyCode === 17) {
        view.get('svgNodes').call(view.get('forceLayout').drag);
        svg.classed('ctrl', true);
      }

      if(!view.get('selectedNode') && !view.get('selectedLink')) return;
      switch(d3.event.keyCode) {
        case 8: // backspace
          d3.event.preventDefault();

        case 46: // delete
          view.removeSelected();
          break;
      }
    }

    function keyup() {
      lastKeyDown = -1;

      // ctrl
      if(d3.event.keyCode === 17) {
        view.get('svgNodes')
          .on('mousedown.drag', null)
          .on('touchstart.drag', null);
        svg.classed('ctrl', false);
      }
    }

    function touchmove() {

      if(view.get('touchState')) {
        d3.event.preventDefault();

        var touch = d3.event.changedTouches[0];
        var elem = document.elementFromPoint(touch.pageX, touch.pageY);

        if(elem.tagName !== 'circle' || d3.select(elem).datum() != view.get('mousedownNode'))
          view.get('touchState').moved = true;
      }
      mousemove.bind(this)();
    }

    var lastResize = 0;

    function resize() {
      lastResize = new Date().getTime();
      var t = lastResize;

      setTimeout(function() {
        if(t != lastResize) return;

        var width = Math.max(200, Math.min(800, view.$().width()));
        var height = Math.max(150, Math.min(600, view.$().height()));

        view.set('svgWidth', width);
        view.set('svgHeight', height);
        view.get('forceLayout').start();

      }, 200);
    }

    // app starts here
    svg.on('mousedown', mousedown)
      .on('mousemove', mousemove)
      .on('mouseup', mouseup)
      .on('touchmove', touchmove);
    d3.select(window)
      .on('keydown', keydown)
      .on('keyup', keyup)
      .on('resize', resize);
  },

  redraw: function() {
    this.syncWithModel();
    this.addRemoveNodesInSvg();
    this.addRemoveLinksInSvg();
    this.updateNodesInSvg();
    this.updateLinksInSvg();

    if(this.get('shouldRedraw'))
      this.set('shouldRedraw', false);
  }.observes('shouldRedraw', 'graph.directed'),

  onSvgChange: function() {
    this.set('svgNodes', this.get('svgBaseNodes'));
    this.set('svgLinks', this.get('svgBaseLinks'));
    this.set('svgLinkLabels', this.get('svgBaseLinkLabels'));
    this.createView();
  }.observes('svg'),

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
