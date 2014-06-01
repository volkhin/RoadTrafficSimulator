define(function(require) {
    "use strict";

    var $ = require("jquery"),
        Point = require("point");

    function Tool(visualizer) {
        this.visualizer = visualizer;
        this.ctx = visualizer.ctx;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.isBound = false;
    }

    Object.defineProperty(Tool.prototype, "canvas", {
        get: function() {
            return this.ctx.canvas;
        },
    });

    Tool.prototype.bind = function() {
        this.isBound = true;
        $(this.canvas).on("mousedown", this.onMouseDown);
        $(this.canvas).on("mouseup", this.onMouseUp);
        $(this.canvas).on("mousemove", this.onMouseMove);
        $(this.canvas).on("mouseout", this.onMouseOut);
    };

    Tool.prototype.unbind = function() {
        this.isBound = false;
        $(this.canvas).off("mousedown", this.onMouseDown);
        $(this.canvas).off("mouseup", this.onMouseUp);
        $(this.canvas).off("mousemove", this.onMouseMove);
        $(this.canvas).off("mouseout", this.onMouseOut);
    };

    Tool.prototype.toggleState = function() {
        if (this.isBound) {
            this.unbind();
        } else {
            this.bind();
        }
    };

    Tool.prototype.onMouseDown = function() {
    };

    Tool.prototype.onMouseUp = function() {
    };

    Tool.prototype.onMouseMove = function() {
    };

    Tool.prototype.onMouseOut = function() {
    };

    Tool.prototype.getPoint = function(e) {
        var point = new Point(
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
        );
        return point;
    };


    return Tool;
});
