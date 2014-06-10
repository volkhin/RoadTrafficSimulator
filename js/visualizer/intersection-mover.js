(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Tool, ToolIntersectionMover;
    Tool = require('visualizer/tool');
    return ToolIntersectionMover = (function(_super) {
      __extends(ToolIntersectionMover, _super);

      function ToolIntersectionMover() {
        ToolIntersectionMover.__super__.constructor.apply(this, arguments);
        this.intersection = null;
      }

      ToolIntersectionMover.prototype.mousedown = function(e) {
        var intersection;
        intersection = this.getHoveredIntersection(this.getCell(e));
        if (intersection) {
          this.intersection = intersection;
          return e.stopImmediatePropagation();
        }
      };

      ToolIntersectionMover.prototype.mouseup = function() {
        return this.intersection = null;
      };

      ToolIntersectionMover.prototype.mousemove = function(e) {
        var cell;
        if (this.intersection) {
          cell = this.getCell(e);
          this.intersection.rect.left(cell.x);
          this.intersection.rect.top(cell.y);
          return this.intersection.update();
        }
      };

      ToolIntersectionMover.prototype.mouseout = function() {
        return this.intersection = null;
      };

      return ToolIntersectionMover;

    })(Tool);
  });

}).call(this);
