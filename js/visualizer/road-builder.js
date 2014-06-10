(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  define(function(require) {
    var Road, Tool, ToolRoadBuilder;
    Tool = require('visualizer/tool');
    Road = require('model/road');
    return ToolRoadBuilder = (function(_super) {
      __extends(ToolRoadBuilder, _super);

      function ToolRoadBuilder() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        ToolRoadBuilder.__super__.constructor.apply(this, args);
        this.sourceIntersection = null;
        this.road = null;
        this.dualRoad = null;
      }

      ToolRoadBuilder.prototype.mousedown = function(e) {
        var cell, hoveredIntersection;
        cell = this.getCell(e);
        hoveredIntersection = this.getHoveredIntersection(cell);
        if (e.shiftKey && (hoveredIntersection != null)) {
          this.sourceIntersection = hoveredIntersection;
          return e.stopImmediatePropagation();
        }
      };

      ToolRoadBuilder.prototype.mouseup = function(e) {
        if (this.road != null) {
          this.visualizer.world.addRoad(this.road);
        }
        if (this.dualRoad != null) {
          this.visualizer.world.addRoad(this.dualRoad);
        }
        return this.road = this.dualRoad = this.sourceIntersection = null;
      };

      ToolRoadBuilder.prototype.mousemove = function(e) {
        var cell, hoveredIntersection;
        cell = this.getCell(e);
        hoveredIntersection = this.getHoveredIntersection(cell);
        if (this.sourceIntersection && hoveredIntersection && this.sourceIntersection.id !== hoveredIntersection.id) {
          if (this.road != null) {
            this.road.target = hoveredIntersection;
            return this.dualRoad.source = hoveredIntersection;
          } else {
            this.road = new Road(this.sourceIntersection, hoveredIntersection);
            return this.dualRoad = new Road(hoveredIntersection, this.sourceIntersection);
          }
        } else {
          return this.road = this.dualRoad = null;
        }
      };

      ToolRoadBuilder.prototype.mouseout = function(e) {
        return this.road = this.dualRoad = this.sourceIntersection = null;
      };

      ToolRoadBuilder.prototype.draw = function() {
        if (this.road != null) {
          this.visualizer.drawRoad(this.road, 0.4);
        }
        if (this.dualRoad != null) {
          return this.visualizer.drawRoad(this.dualRoad, 0.4);
        }
      };

      return ToolRoadBuilder;

    })(Tool);
  });

}).call(this);
