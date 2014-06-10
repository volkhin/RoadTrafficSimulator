(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Rect, Tool, ToolHighlighter, settings;
    Tool = require('visualizer/tool');
    Rect = require('geom/rect');
    settings = require('settings');
    return ToolHighlighter = (function(_super) {
      __extends(ToolHighlighter, _super);

      function ToolHighlighter() {
        ToolHighlighter.__super__.constructor.apply(this, arguments);
        this.mousePos = null;
      }

      ToolHighlighter.prototype.mousemove = function(e) {
        var cell, hoveredIntersection, id, intersection, _ref;
        cell = this.getCell(e);
        hoveredIntersection = this.getHoveredIntersection(cell);
        this.mousePos = cell;
        _ref = this.visualizer.world.intersections.all();
        for (id in _ref) {
          intersection = _ref[id];
          intersection.color = null;
        }
        if (hoveredIntersection != null) {
          return hoveredIntersection.color = settings.colors.hoveredIntersection;
        }
      };

      ToolHighlighter.prototype.mouseout = function() {
        return this.mousePos = null;
      };

      ToolHighlighter.prototype.draw = function() {
        var cell;
        if (this.mousePos) {
          cell = new Rect(this.mousePos.x, this.mousePos.y, 1, 1);
          return this.visualizer.graphics.fillRect(cell, settings.colors.hoveredGrid, 0.5);
        }
      };

      return ToolHighlighter;

    })(Tool);
  });

}).call(this);
