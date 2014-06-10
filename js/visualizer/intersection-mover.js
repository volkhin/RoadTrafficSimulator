define(function(require) {
  'use strict';

  var Tool = require('visualizer/tool');

  function ToolIntersectionMover() {
    Tool.apply(this, arguments);
    this.intersection = null;
  }

  ToolIntersectionMover.prototype = Object.create(Tool.prototype);

  ToolIntersectionMover.prototype.mousedown = function(e) {
    var intersection = this.getHoveredIntersection(this.getCell(e));
    if (intersection) {
      this.intersection = intersection;
      e.stopImmediatePropagation();
    }
  };

  ToolIntersectionMover.prototype.mouseup = function() {
    this.intersection = null;
  };

  ToolIntersectionMover.prototype.mousemove = function(e) {
    if (this.intersection) {
      var cell = this.getCell(e);
      this.intersection.rect.left(cell.x);
      this.intersection.rect.top(cell.y);
      this.intersection.update(); // FIXME: should be done automatically
    }
  };

  ToolIntersectionMover.prototype.mouseout = function() {
    this.intersection = null;
  };

  return ToolIntersectionMover;
});
