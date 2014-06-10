(function() {
  'use strict';
  define(function(require) {
    var $, Point, Rect, Segment;
    $ = require('jquery');
    Point = require('geom/point');
    Segment = require('geom/segment');
    return Rect = (function() {
      function Rect(x, y, _width, _height) {
        this.x = x;
        this.y = y;
        this._width = _width != null ? _width : 0;
        this._height = _height != null ? _height : 0;
      }

      Rect.copy = function(rect) {
        return new Rect(rect.x, rect.y, rect._width, rect._height);
      };

      Rect.prototype.toJSON = function() {
        return $.extend({}, this);
      };

      Rect.prototype.area = function() {
        return this.width() * this.height();
      };

      Rect.prototype.left = function(left) {
        if (left != null) {
          this.x = left;
        }
        return this.x;
      };

      Rect.prototype.right = function(right) {
        if (right != null) {
          this.x = right - this.width();
        }
        return this.x + this.width();
      };

      Rect.prototype.width = function(width) {
        if (width != null) {
          this._width = width;
        }
        return this._width;
      };

      Rect.prototype.top = function(top) {
        if (top != null) {
          this.y = top;
        }
        return this.y;
      };

      Rect.prototype.bottom = function(bottom) {
        if (bottom != null) {
          this.y = bottom - this.height();
        }
        return this.y + this.height();
      };

      Rect.prototype.height = function(height) {
        if (height != null) {
          this._height = height;
        }
        return this._height;
      };

      Rect.prototype.center = function(center) {
        if (center != null) {
          this.x = center.x - this.width() / 2;
          this.y = center.y - this.height() / 2;
        }
        return new Point(this.x + this.width() / 2, this.y + this.height() / 2);
      };

      Rect.prototype.containsPoint = function(point) {
        var _ref, _ref1;
        return (this.left() <= (_ref = point.x) && _ref <= this.right()) && (this.top() <= (_ref1 = point.y) && _ref1 <= this.bottom());
      };

      Rect.prototype.containsRect = function(rect) {
        return this.left() <= rect.left() && rect.right() <= this.right() && this.top() <= rect.top() && rect.bottom() <= this.bottom();
      };

      Rect.prototype.getVertices = function() {
        return [new Point(this.left(), this.top()), new Point(this.right(), this.top()), new Point(this.right(), this.bottom()), new Point(this.left(), this.bottom())];
      };

      Rect.prototype.getSide = function(i) {
        var vertices;
        vertices = this.getVertices();
        return new Segment(vertices[i], vertices[(i + 1) % 4]);
      };

      Rect.prototype.getSectorId = function(point) {
        var offset;
        offset = point.subtract(this.center());
        if (offset.y <= 0 && Math.abs(offset.x) <= Math.abs(offset.y)) {
          return 0;
        }
        if (offset.x >= 0 && Math.abs(offset.x) >= Math.abs(offset.y)) {
          return 1;
        }
        if (offset.y >= 0 && Math.abs(offset.x) <= Math.abs(offset.y)) {
          return 2;
        }
        if (offset.x <= 0 && Math.abs(offset.x) >= Math.abs(offset.y)) {
          return 3;
        }
        throw Error('algorithm error');
      };

      Rect.prototype.getSector = function(point) {
        return this.getSide(this.getSectorId(point));
      };

      return Rect;

    })();
  });

}).call(this);
