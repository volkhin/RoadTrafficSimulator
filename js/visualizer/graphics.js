(function() {
  'use strict';
  var __slice = [].slice;

  define(function() {
    var Graphics;
    return Graphics = (function() {
      function Graphics(ctx) {
        this.ctx = ctx;
      }

      Graphics.prototype.fillRect = function(rect, style, alpha) {
        var _alpha;
        if (style != null) {
          this.ctx.fillStyle = style;
        }
        _alpha = this.ctx.globalAlpha;
        if (alpha != null) {
          this.ctx.globalAlpha = alpha;
        }
        this.ctx.fillRect(rect.left(), rect.top(), rect.width(), rect.height());
        return this.ctx.globalAlpha = _alpha;
      };

      Graphics.prototype.drawImage = function(image, rect) {
        return this.ctx.drawImage(image, rect.left(), rect.top(), rect.width(), rect.height());
      };

      Graphics.prototype.clear = function(color) {
        this.ctx.fillStyle = color;
        return this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      };

      Graphics.prototype.moveTo = function(point) {
        return this.ctx.moveTo(point.x, point.y);
      };

      Graphics.prototype.lineTo = function(point) {
        return this.ctx.lineTo(point.x, point.y);
      };

      Graphics.prototype.drawLine = function(source, target) {
        this.ctx.beginPath();
        this.moveTo(source);
        return this.lineTo(target);
      };

      Graphics.prototype.drawSegment = function(segment) {
        return this.drawLine(segment.source, segment.target);
      };

      Graphics.prototype.fill = function(style, alpha) {
        var _alpha;
        this.ctx.fillStyle = style;
        _alpha = this.ctx.globalAlpha;
        if (alpha != null) {
          this.ctx.globalAlpha = alpha;
        }
        this.ctx.fill();
        return this.ctx.globalAlpha = _alpha;
      };

      Graphics.prototype.stroke = function(style) {
        this.ctx.strokeStyle = style;
        return this.ctx.stroke();
      };

      Graphics.prototype.polyline = function() {
        var point, points, _i, _len, _ref;
        points = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (points.length >= 1) {
          this.ctx.beginPath();
          this.moveTo(points[0]);
          _ref = points.slice(1);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            point = _ref[_i];
            this.lineTo(point);
          }
          return this.ctx.closePath();
        }
      };

      Graphics.prototype.save = function() {
        return this.ctx.save();
      };

      Graphics.prototype.restore = function() {
        return this.ctx.restore();
      };

      return Graphics;

    })();
  });

}).call(this);
