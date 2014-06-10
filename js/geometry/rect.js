define(function(require) {
  'use strict';

  var $ = require('jquery'),
      Point = require('geom/point'),
      Segment = require('geom/segment');

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
      return this.width * this.height;
    }
  });

  Object.defineProperty(Rect.prototype, 'left', {
    get: function() {
      return this.x;
    },
    set: function(left) {
      this.x = left;
    }
  });

  Object.defineProperty(Rect.prototype, 'top', {
    get: function() {
      return this.y;
    },
    set: function(top) {
      this.y = top;
    }
  });

  Object.defineProperty(Rect.prototype, 'right', {
    get: function() {
      return this.x + this.width;
    },
    set: function(right) {
      this.x = right - this.height;
    }
  });

  Object.defineProperty(Rect.prototype, 'bottom', {
    get: function() {
      return this.y + this.height;
    },
    set: function(bottom) {
      this.y = bottom - this.height;
    }
  });

  Object.defineProperty(Rect.prototype, 'center', {
    get: function() {
      return new Point(this.x + this.width / 2, this.y + this.height / 2);
    },
    set: function(point) {
      this.x = point.x - this.width / 2;
      this.y = point.y - this.height / 2;
    }
  });

  Rect.prototype.containsPoint = function(point) {
    if (!point instanceof Point) {
      throw Error('Should be a point!');
    }
    return this.left <= point.x && point.x <= this.right &&
        this.top <= point.y && point.y <= this.bottom;
  };

  Rect.prototype.containsRect = function(rect) {
    if (!rect instanceof Rect) {
      throw Error('Should be a rect!');
    }
    return this.left <= rect.left && rect.right <= this.right &&
               this.top <= rect.top && rect.bottom <= this.bottom;
  };

  Object.defineProperty(Rect.prototype, 'vertices', {
    get: function() {
      // returns vertices in CW order starting with the top-left
      var x = this.x, y = this.y;
      return [
              new Point(x, y),
              new Point(x + this.width, y),
              new Point(x + this.width, y + this.height),
              new Point(x, y + this.height)
      ];
    }
  });

  Rect.prototype.getSide = function(i) {
    // returns sides in CW order starting with the top
    var vertices = this.vertices;
    return new Segment(vertices[i], vertices[(i + 1) % 4]);
  };

  Rect.prototype.getSectorId = function(point) {
    // returns the closest side to the point
    var center = this.center;
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
