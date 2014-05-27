define([], function() {
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

    return {
        fillRect: fillRect,
        clear: clear,
        lineTo: lineTo,
        moveTo: moveTo,
    };
});
