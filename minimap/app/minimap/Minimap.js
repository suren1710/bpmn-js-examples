'use strict';

var domify = require('min-dom/lib/domify'),
    domDelegate = require('min-dom/lib/delegate'),
    domAttr = require('min-dom/lib/attr'),
    domQuery = require('min-dom/lib/query'),
    domRemove = require('min-dom/lib/remove');

var BpmnViewer = require('bpmn-js');

BpmnViewer.prototype._modules = [
  require('bpmn-js/lib/core'),
  require('diagram-js/lib/features/dragging')
];

function Minimap(eventBus, canvas, dragging) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this._createContainer();

  eventBus.on([ 'commandStack.changed', 'import.parse.complete' ], this.importDefinitions.bind(this), true);

  eventBus.on('import.done', this.init.bind(this), true);

  eventBus.on('canvas.move', 1000, this.updateMinimap.bind(this), true);
}

module.exports = Minimap;

Minimap.$inject = [ 'eventBus', 'canvas', 'dragging' ];


Minimap.prototype._createContainer = function(context) {
  var bpmnContainer = domQuery('.bjs-container'),
      parentContainer = bpmnContainer.parentElement;

  var overlay = this._overlay = domify('<div id="minimap-overlay"></div>');

  var container = this._container = domify('<div id="minimap"></div>');

  container.style.height = '200px';

  container.appendChild(overlay);

  parentContainer.insertBefore(container, bpmnContainer);

  this._instance = new BpmnViewer({
    container: '#minimap'
  });
};

Minimap.prototype.init = function(context) {
  var viewer = this._instance,
      canvas = viewer.get('canvas'),
      eventBus = viewer.get('eventBus'),
      dragging = viewer.get('dragging');

  var container = this._container;

  canvas.zoom('fit-viewport');

  domDelegate.bind(container, '#minimap-overlay', 'mousedown', function(event) {
    //only activate, if originalEvent exists
    dragging.init(event, { x: event.offsetX, y: event.offsetY }, 'minimap.move', {
      cursor: 'grabbing',
      data: {
        context: {}
      }
    });
  });

  eventBus.on('minimap.move.move', this.translateOverlay, this);

  eventBus.on('minimap.move.cleanup', function(event) {
    console.log('cleanup', event);
  });

  eventBus.on('minimap.move.start', function(event) {
    this.initMoving();
  }, this);
};


Minimap.prototype.translateOverlay = function(event) {
  var overlay = this._overlay,
      scale = this._scale;

  console.log(event);
};


Minimap.prototype.initMoving = function() {
  var viewer = this._instance,
      canvas = viewer.get('canvas');

  this._scale = canvas.viewbox().scale;
};


Minimap.prototype.updateMinimap = function(context) {
  var viewer = this._instance,
      mmCanvas = viewer.get('canvas');

  // var overlay = domQuery('#minimap-overlay');
  mmCanvas.scroll({
    dx: context.dx,
    dy: context.dy
  });
};

Minimap.prototype.importDefinitions = function(context) {
  var viewer = this._instance,
      canvas = this._canvas;

  var definitions = context.definitions,
      rootElement;

  if (!definitions) {
    rootElement = canvas.getRootElement();
    definitions = rootElement.businessObject.$parent;
  }

  viewer.importDefinitions(definitions, function(err, importWarnings) {

    viewer._emit('import.done', { error: err, warnings: importWarnings });
  });
};
