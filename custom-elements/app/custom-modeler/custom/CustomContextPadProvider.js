'use strict';

var inherits = require('inherits');

var ContextPadProvider = require('bpmn-js/lib/features/context-pad/ContextPadProvider');

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    bind = require('lodash/function/bind');

function CustomContextPadProvider(contextPad, modeling, elementFactory, connect,
                                  create, popupMenu, canvas, rules, translate) {

  ContextPadProvider.call(this, contextPad, modeling, elementFactory, connect, create,
                    popupMenu, canvas, rules, translate);

  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);

    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

    if (isAny(businessObject, [ 'custom:triangle', 'custom:circle'])) {
      assign(actions, {
        'connect': {
          group: 'connect',
          className: 'bpmn-icon-connection-multi',
          title: translate('Connect using custom connection'),
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });
    }

    return actions;
  }
}

inherits(CustomContextPadProvider, ContextPadProvider);

CustomContextPadProvider.$inject = [
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'canvas',
  'rules',
  'translate'
];

module.exports = CustomContextPadProvider;

function isAny(businessObject, types) {
  var isAny = false;

  forEach(types, function(type) {
    if (businessObject.type === type) {
      isAny = true;
    }
  });

  return isAny;
}
