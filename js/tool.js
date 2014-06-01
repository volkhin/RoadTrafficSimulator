define(function(require) {
    "use strict";

    var Point = require("point");

    function Tool(visualizer) {
        this.visualizer = visualizer;
        this.ctx = visualizer.ctx;
    }

    Object.defineProperty(Tool.prototype, "canvas", {
        get: function() {
            return this.ctx.canvas;
        },
    });

    Tool.prototype.getPoint = function(e) {
        var point = new Point(
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
        );
        return point;
    };


    return Tool;
});
