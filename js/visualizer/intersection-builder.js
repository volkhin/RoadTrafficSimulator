(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Intersection, Rect, Tool, ToolIntersectionBuilder;
    Tool = require('visualizer/tool');
    Intersection = require('model/intersection');
    Rect = require('geom/rect');
    return ToolIntersectionBuilder = (function(_super) {
      __extends(ToolIntersectionBuilder, _super);

      function ToolIntersectionBuilder() {
        ToolIntersectionBuilder.__super__.constructor.apply(this, arguments);
        this.tempIntersection = null;
        this.mouseDownPos = null;
      }

      ToolIntersectionBuilder.prototype.mousedown = function(e) {
        var rect;
        this.mouseDownPos = this.getCell(e);
        if (e.shiftKey) {
          rect = new Rect(this.mouseDownPos.x, this.mouseDownPos.y, 1, 1);
          this.tempIntersection = new Intersection(rect);
          return e.stopImmediatePropagation();
        }
      };

      ToolIntersectionBuilder.prototype.mouseup = function() {
        if (this.tempIntersection) {
          this.visualizer.world.addIntersection(this.tempIntersection);
          this.tempIntersection = null;
        }
        return this.mouseDownPos = null;
      };

      ToolIntersectionBuilder.prototype.mousemove = function(e) {
        var rect;
        if (this.tempIntersection) {
          rect = this.visualizer.zoomer.getBoundingBox(this.mouseDownPos, this.getCell(e));
          return this.tempIntersection.rect = rect;
        }
      };

      ToolIntersectionBuilder.prototype.mouseout = function() {
        this.mouseDownPos = null;
        return this.tempIntersection = null;
      };

      ToolIntersectionBuilder.prototype.draw = function() {
        if (this.tempIntersection) {
          return this.visualizer.drawIntersection(this.tempIntersection, 0.4);
        }
      };

      return ToolIntersectionBuilder;

    })(Tool);
  });

}).call(this);
