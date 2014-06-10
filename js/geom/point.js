(function() {
  'use strict';
  define([], function() {
    var Point;
    return Point = (function() {
      function Point(x, y) {
        this.x = x != null ? x : 0;
        this.y = y != null ? y : 0;
      }

      Point.prototype.add = function(o) {
        return new Point(this.x + o.x, this.y + o.y);
      };

      Point.prototype.subtract = function(o) {
        return new Point(this.x - o.x, this.y - o.y);
      };

      Point.prototype.mult = function(k) {
        return new Point(this.x * k, this.y * k);
      };

      Point.prototype.divide = function(k) {
        return new Point(this.x / k, this.y / k);
      };

      Point.prototype.normalize = function() {
        var length;
        length = this.length();
        return new Point(this.x / length, this.y / length);
      };

      Point.prototype.length = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      };

      Point.prototype.direction = function() {
        return Math.atan2(this.y, this.x);
      };

      return Point;

    })();
  });

}).call(this);
