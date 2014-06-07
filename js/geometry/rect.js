define(function(require) {
  'use strict';

  var $ = require('jquery'),
      Point = require('geometry/point'),
      Segment = require('geometry/segment');

  function Rect(arg0, arg1, arg2, arg3) {
    this.x = arg0;
    this.y = arg1;
    this.width = arg2 || 0;
    this.height = arg3 || 0;
  }

  Rect.copy = function(rect) {
    return new Rect(rect.x, rect.y, rect.width, rect.height);
  };

  Rect.prototype.toJSON = function() {
    var obj = $.extend({}, this);
    return obj;
  };

  Object.defineProperty(Rect.prototype, 'area', {
    get: function() {
      return this.getWidth() * this.getHeight();
    }
  });

  /* Object.defineProperty(Rect.prototype, "position", {
        get: function() {
            return new Point(this.x, this.y);
        },
        set: function(position) {
            this.x = position.x;
            this.y = position.y;
        },
    }); */

  Rect.prototype.setLeft = function(x) {
    this.x = x;
    return this;
  };

  Rect.prototype.getLeft = function() {
    return this.x;
  };

  Rect.prototype.setRight = function(x) {
    this.x = x - this.getWidth();
    return this;
  };

  Rect.prototype.getRight = function() {
    return this.getLeft() + this.getWidth();
  };

  Rect.prototype.setTop = function(y) {
    this.y = y;
    return this;
  };

  Rect.prototype.getTop = function() {
    return this.y;
  };

  Rect.prototype.setBottom = function(y) {
    this.y = y - this.getHeight();
    return this;
  };

  Rect.prototype.getBottom = function() {
    return this.getTop() + this.getHeight();
  };

  Rect.prototype.setWidth = function(width) {
    this.width = width;
    return this;
  };

  Rect.prototype.getWidth = function() {
    return this.width;
  };

  Rect.prototype.setHeight = function(height) {
    this.height = height;
    return this;
  };

  Rect.prototype.getHeight = function() {
    return this.height;
  };

  Rect.prototype.setCenter = function(point) {
    this.x = point.x - this.width / 2;
    this.y = point.y - this.height / 2;
    return this;
  };

  Rect.prototype.getCenter = function() {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  };

  Rect.prototype.containsPoint = function(point) {
    if (!point instanceof Point) {
      throw Error('Should be a point!');
    }
    return this.getLeft() <= point.x && point.x <= this.getRight() &&
        this.getTop() <= point.y && point.y <= this.getBottom();
  };

  Rect.prototype.containsRect = function(rect) {
    if (!rect instanceof Rect) {
      throw Error('Should be a rect!');
    }
    return this.getLeft() <= rect.getLeft() &&
               rect.getRight() <= this.getRight() &&
               this.getTop() <= rect.getTop() &&
               rect.getBottom() <= this.getBottom();
  };

  Rect.prototype.getVertices = function() {
    // returns vertices in CW order starting with the top-left
    var x = this.x, y = this.y;
    return [
            new Point(x, y),
            new Point(x + this.getWidth(), y),
            new Point(x + this.getWidth(), y + this.getHeight()),
            new Point(x, y + this.getHeight())
    ];
  };

  Rect.prototype.getSide = function(i) {
    // returns sides in CW order starting with the top
    var vertices = this.getVertices();
    return new Segment(vertices[i], vertices[(i + 1) % 4]);
  };

  Rect.prototype.getSectorId = function(point) {
    // returns the closest side to the point
    var center = this.getCenter();
    var offset = point.subtract(center);
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
    throw Error('Algorithm error');
  };

  Rect.prototype.getSector = function(point) {
    return this.getSide(this.getSectorId(point));
  };

  return Rect;
});
