(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Mover, Tool;
    Tool = require('visualizer/tool');
    return Mover = (function(_super) {
      __extends(Mover, _super);

      function Mover() {
        Mover.__super__.constructor.apply(this, arguments);
        this.startPosition = null;
      }

      Mover.prototype.contextmenu = function() {
        return false;
      };

      Mover.prototype.mousedown = function(e) {
        this.startPosition = this.getPoint(e);
        return e.stopImmediatePropagation();
      };

      Mover.prototype.mouseup = function() {
        return this.startPosition = null;
      };

      Mover.prototype.mousemove = function(e) {
        var offset;
        if (this.startPosition) {
          offset = this.getPoint(e).subtract(this.startPosition);
          this.visualizer.zoomer.moveCenter(offset);
          return this.startPosition = this.getPoint(e);
        }
      };

      Mover.prototype.mouseout = function() {
        return this.startPosition = null;
      };

      return Mover;

    })(Tool);
  });

}).call(this);
