define([], function() {
    "use strict";

    function Graphics(ctx) {
        this.ctx = ctx;
    }

    Graphics.prototype.fillRect = function(rect, style) {
        if (style) {
            this.ctx.fillStyle = style;
        }
        this.ctx.fillRect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
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

    Graphics.prototype.fill = function(style) {
        this.ctx.fillStyle = style;
        this.ctx.fill();
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
