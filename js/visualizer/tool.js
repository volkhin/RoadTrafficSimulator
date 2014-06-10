define(function(require) {
  'use strict';

  var $ = require('jquery'),
      _ = require('underscore'),
      Point = require('geom/point'),
      Rect = require('geometry/rect');
  require('jquery-mousewheel');

  var METHODS = [
    'click',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseout',
    'mousewheel',
    'contextmenu'
  ];

  function Tool(visualizer, autobind) {
    this.visualizer = visualizer;
    this.ctx = visualizer.ctx;
    _.each(METHODS, function(methodName) {
      if (methodName in this) {
        this[methodName] = this[methodName].bind(this);
      }
    }, this);
    this.isBound = false;
    if (autobind) {
      this.bind();
    }
  }

  Object.defineProperty(Tool.prototype, 'canvas', {
    get: function() {
      return this.ctx.canvas;
    }
  });

  Tool.prototype.bind = function() {
    this.isBound = true;
    _.each(METHODS, function(methodName) {
      if (methodName in this) {
        $(this.canvas).on(methodName, this[methodName]);
      }
    }, this);
  };

  Tool.prototype.unbind = function() {
    this.isBound = false;
    _.each(METHODS, function(methodName) {
      if (methodName in this) {
        $(this.canvas).off(methodName, this[methodName]);
      }
    }, this);
  };

  Tool.prototype.toggleState = function() {
    if (this.isBound) {
      this.unbind();
    } else {
      this.bind();
    }
  };

  Tool.prototype.draw = function() {
  };

  Tool.prototype.getPoint = function(e) {
    var point = new Point(
        e.pageX - this.canvas.offsetLeft,
        e.pageY - this.canvas.offsetTop
        );
    return point;
  };

  Tool.prototype.getCell = function(e) {
    return this.visualizer.zoomer.toCellCoords(this.getPoint(e));
  };

  Tool.prototype.getHoveredIntersection = function(cell) {
    var cellRect = new Rect(cell.x, cell.y, 1, 1);
    var intersections = this.visualizer.world.intersections.all();
    for (var key in intersections) {
      if (intersections.hasOwnProperty(key)) {
        var intersection = intersections[key];
        if (intersection.rect.containsRect(cellRect)) {
          return intersection;
        }
      }
    }
  };

  return Tool;
});
