define([], function() {
    "use strict";

    function fillRect(rect, ctx) {
        ctx.fillRect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
    }

    function clear(color, ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    function moveTo(point, ctx) {
        ctx.moveTo(point.x, point.y);
    }

    function lineTo(point, ctx) {
        ctx.lineTo(point.x, point.y);
    }

    function drawLine(source, target, ctx) {
        ctx.beginPath();
        moveTo(source, ctx);
        lineTo(target, ctx);
    }

    function drawSegment(segment, ctx) {
        drawLine(segment.source, segment.target, ctx);
    }

    function polyline(ctx) {
        if (arguments.length <= 1) {
            return;
        }

        var points = Array.prototype.slice.call(arguments, 1);
        ctx.beginPath();
        moveTo(points[0], ctx);
        for (var i = 1; i < points.length; i++) {
            lineTo(points[i], ctx);
        }
        ctx.closePath();
    }

    return {
        fillRect: fillRect,
        clear: clear,
        lineTo: lineTo,
        moveTo: moveTo,
        polyline: polyline,
        drawLine: drawLine,
        drawSegment: drawSegment,
    };
});
