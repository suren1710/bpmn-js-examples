'use strict';

// we use fs + brfs to inline an example XML document.
// exclude fs in package.json#browser + use the brfs transform
// to generate a clean browserified bundle


// inlined in result file via brfs
var pizzaDiagram = require('../resources/pizza-collaboration.bpmn');

var domQuery = require('min-dom/lib/query'),
    domify = require('min-dom/lib/domify');

var Snap = require('diagram-js/vendor/snapsvg');

// require the viewer, make sure you added it to your project
// dependencies via npm install --save-dev bpmn-js
var BpmnModeler = require('bpmn-js/lib/Modeler'),
    minimapModule = require('./minimap');

var modeler = new BpmnModeler({ container: '#canvas', additionalModules: [ ] });

modeler.importXML(pizzaDiagram, function(err) {
  // var moEventbus = modeler.get('eventBus'),
  var moCanvas = modeler.get('canvas');

  moCanvas.zoom('fit-viewport');

  var svg = domQuery('.layer-base');

  svg.id = 'djs-svg';

  var viewbox = moCanvas.viewbox();

  var mirror = domify([
    '<svg id="mm-mirror" width="300" height="200">',
      '<use xlink:href="#djs-svg"></use>',
      // '<rect id="mm-overlay" x="100" y="100" width="500" height="500" fill="#ccc" fill-opacity="0.5" stroke="#444"/>',
    '</svg>'
  ].join('\n'));

  var minimap = domQuery('#minimap');

  minimap.appendChild(mirror);

  mirror = window.mirror = Snap(mirror);

  var overlay = mirror.rect(100, 100, 500, 500);

  overlay.attr({
    fill: '#ccc',
    'fill-opacity': '0.5',
    stroke: '#444'
  });

  var bbox = mirror.getBBox();

  var matrix = new Snap.Matrix().scale(0.5, 0.5);

  mirror.transform(matrix);

  // minimap.importXML(pizzaDiagram, function(err) {
  //   var mmEventbus = minimap.get('eventBus'),
  //       mmCanvas = minimap.get('canvas'),
  //       mmContainer = mmCanvas._container;
  //
  //   var overlay = domQuery('#minimap-overlay');
  //
  //   mmCanvas.viewbox(moCanvas.viewbox());
  //
  //   moEventbus.on('commandStack.changed', function(context) {
  //     minimap.importDefinitions(modeler.definitions, function(err, importWarnings) {
  //
  //       minimap._emit('import.done', { error: err, warnings: importWarnings });
  //     });
  //   }, true);
  //
  //   moEventbus.on('canvas.viewbox.changed', function(context) {
  //     var viewbox = context.viewbox;
  //
  //     console.log(viewbox);
  //     console.dir(overlay);
  //   }, true);
  // });
});
