define([], function() {
    "use strict";

    function Graphics(ctx) {
        this.ctx = ctx;
    }

    Graphics.prototype.fillRect = function(rect, style, alpha) {
        if (style) {
            this.ctx.fillStyle = style;
        }
        var oldAlpha = this.ctx.globalAlpha;
        if (alpha) {
            this.ctx.globalAlpha = alpha;
        }
        this.ctx.fillRect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
        this.ctx.globalAlpha = oldAlpha;
    };

    Graphics.prototype.clear = function(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    };

    Graphics.prototype.moveTo = function(point) {
        this.ctx.moveTo(point.x, point.y);
    };

    Graphics.prototype.lineTo = function(point) {
        this.ctx.lineTo(point.x, point.y);
    };

    Graphics.prototype.drawLine = function(source, target) {
        this.ctx.beginPath();
        this.moveTo(source);
        this.lineTo(target);
    };

    Graphics.prototype.drawSegment = function(segment) {
        this.drawLine(segment.source, segment.target);
    };

    Graphics.prototype.fill = function(style, alpha) {
        this.ctx.fillStyle = style;
        var oldAlpha = this.ctx.globalAlpha;
        if (alpha) {
            this.ctx.globalAlpha = alpha;
        }
        this.ctx.fill();
        this.ctx.globalAlpha = oldAlpha;
    };

    Graphics.prototype.stroke = function(style) {
        this.ctx.strokeStyle = style;
        this.ctx.stroke();
    };

    Graphics.prototype.polyline = function() {
        if (arguments.length <= 1) {
            return;
        }

        var points = Array.prototype.slice.call(arguments);
        this.ctx.beginPath();
        this.moveTo(points[0]);
        for (var i = 1; i < points.length; i++) {
            this.lineTo(points[i]);
        }
        this.ctx.closePath();
    };

    return Graphics;
});
