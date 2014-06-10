define(function(require) {
  'use strict';

  var _ = require('underscore'),
      Tool = require('visualizer/tool'),
      Rect = require('geom/rect'),
      settings = require('settings');

  function ToolHighlighter() {
    Tool.apply(this, arguments);
    this.mousePos = null;
  }

  ToolHighlighter.prototype = Object.create(Tool.prototype);

  ToolHighlighter.prototype.mousedown = function() {
  };

  ToolHighlighter.prototype.mouseup = function() {
  };

  ToolHighlighter.prototype.mousemove = function(e) {
    var cell = this.getCell(e);
    var hoveredIntersection = this.getHoveredIntersection(cell);
    this.mousePos = cell;
    _.each(this.visualizer.world.intersections.all(), function(intersection) {
      intersection.color = null;
    });
    if (hoveredIntersection) {
      hoveredIntersection.color = settings.colors.hoveredIntersection;
    }
  };

  ToolHighlighter.prototype.mouseout = function() {
    this.mousePos = null;
  };

  ToolHighlighter.prototype.draw = function() {
    if (this.mousePos) {
      var cell = new Rect(this.mousePos.x, this.mousePos.y, 1, 1);
      this.visualizer.graphics.fillRect(cell, settings.colors.hoveredGrid, 0.5);
    }
  };

  return ToolHighlighter;
});
