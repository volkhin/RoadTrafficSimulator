(function() {
  'use strict';
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  define(function(require) {
    var Point, Rect, Tool, Zoomer;
    Point = require('geom/point');
    Rect = require('geom/rect');
    Tool = require('visualizer/tool');
    return Zoomer = (function(_super) {
      __extends(Zoomer, _super);

      function Zoomer() {
        var args, defaultZoom, visualizer;
        defaultZoom = arguments[0], visualizer = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        this.defaultZoom = defaultZoom;
        this.visualizer = visualizer;
        Zoomer.__super__.constructor.apply(this, [this.visualizer].concat(__slice.call(args)));
        this.ctx = this.visualizer.ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this._scale = 1;
        this.screenCenter = new Point(this.width / 2, this.height / 2);
        this.center = new Point(this.width / 2, this.height / 2);
      }

      Zoomer.property('scale', {
        get: function() {
          return this._scale;
        },
        set: function(scale) {
          return this.zoom(scale, this.screenCenter);
        }
      });

      Zoomer.prototype.toCellCoords = function(point) {
        var centerOffset, x, y;
        centerOffset = point.subtract(this.center).divide(this.scale);
        x = Math.floor(centerOffset.x / this.defaultZoom);
        y = Math.floor(centerOffset.y / this.defaultZoom);
        return new Point(x, y);
      };

      Zoomer.prototype.getBoundingBox = function(cell1, cell2) {
        var x1, x2, y1, y2, _ref, _ref1;
        if (cell1 == null) {
          cell1 = this.toCellCoords(new Point(0, 0));
        }
        if (cell2 == null) {
          cell2 = this.toCellCoords(new Point(this.width, this.height));
        }
        x1 = cell1.x;
        y1 = cell1.y;
        x2 = cell2.x;
        y2 = cell2.y;
        _ref = [Math.min(x1, x2), Math.max(x1, x2)], x1 = _ref[0], x2 = _ref[1];
        _ref1 = [Math.min(y1, y2), Math.max(y1, y2)], y1 = _ref1[0], y2 = _ref1[1];
        return new Rect(x1, y1, x2 - x1, y2 - y1);
      };

      Zoomer.prototype.transform = function() {
        var k;
        this.ctx.translate(this.center.x, this.center.y);
        k = this.scale * this.defaultZoom;
        return this.ctx.scale(k, k);
      };

      Zoomer.prototype.zoom = function(k, zoomCenter) {
        var offset;
        if (k == null) {
          k = 1;
        }
        offset = this.center.subtract(zoomCenter);
        this.center = zoomCenter.add(offset.mult(k / this._scale));
        return this._scale = k;
      };

      Zoomer.prototype.moveCenter = function(offset) {
        return this.center = this.center.add(offset);
      };

      Zoomer.prototype.mousewheel = function(e) {
        var offset, zoomFactor;
        offset = e.deltaY * e.deltaFactor;
        zoomFactor = Math.pow(2, 0.001 * offset);
        this.zoom(this.scale * zoomFactor, this.getPoint(e));
        return e.preventDefault();
      };

      return Zoomer;

    })(Tool);
  });

}).call(this);
