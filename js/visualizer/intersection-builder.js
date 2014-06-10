define(function(require) {
  'use strict';

  var Tool = require('visualizer/tool'),
      Intersection = require('model/intersection'), // TODO: decouple
      Rect = require('geom/rect');

  function ToolIntersectionBuilder() {
    Tool.apply(this, arguments);
    this.tempIntersection = null;
    this.mouseDownPos = null;
  }

  ToolIntersectionBuilder.prototype = Object.create(Tool.prototype);

  ToolIntersectionBuilder.prototype.mousedown = function(e) {
    this.mouseDownPos = this.getCell(e);
    if (e.shiftKey) {
      var rect = new Rect(this.mouseDownPos.x, this.mouseDownPos.y, 1, 1);
      this.tempIntersection = new Intersection(rect);
      e.stopImmediatePropagation();
    }
  };

  ToolIntersectionBuilder.prototype.mouseup = function() {
    if (this.tempIntersection) {
      this.visualizer.world.addIntersection(this.tempIntersection);
      this.tempIntersection = null;
    }
    this.mouseDownPos = null;
  };

  ToolIntersectionBuilder.prototype.mousemove = function(e) {
    if (this.tempIntersection) {
      this.tempIntersection.rect = this.visualizer.zoomer.getBoundingBox(
          this.mouseDownPos, this.getCell(e));
    }
  };

  ToolIntersectionBuilder.prototype.mouseout = function() {
    this.tempIntersection = null;
    this.mouseDownPos = null;
  };

  ToolIntersectionBuilder.prototype.draw = function() {
    if (this.tempIntersection) {
      this.visualizer.drawIntersection(this.tempIntersection, 0.4);
    }
  };

  return ToolIntersectionBuilder;
});
