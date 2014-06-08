define(function(require) {
  'use strict';

  var $ = require('jquery'),
      _ = require('underscore'),
      ControlSignals = require('control-signals'),
      Rect = require('geometry/rect');

  function Intersection(arg0) {
    this.id = window.__nextId++;
    this.rect = arg0;
    this.roads = [];
    this.inRoads = [];
    this.controlSignals = new ControlSignals();
  }

  Intersection.copy = function(intersection) {
    intersection.rect = Rect.copy(intersection.rect);
    var result = Object.create(Intersection.prototype);
    result = $.extend(result, intersection);
    result.roads = [];
    result.inRoads = [];
    result.controlSignals = new ControlSignals();
    return result;
  };

  Intersection.prototype.toJSON = function() {
    var obj = $.extend({}, this);
    obj = _.pick(obj, ['id', 'rect']);
    return obj;
  };

  Intersection.prototype.update = function() {
    _.each(this.roads, function(road) {
      road.update();
    });
    _.each(this.inRoads, function(road) {
      road.update();
    });
  };

  return Intersection;
});
