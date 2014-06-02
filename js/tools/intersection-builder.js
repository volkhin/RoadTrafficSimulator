define(function(require) {
    "use strict";

    var Tool = require("tools/tool"),
        Intersection = require("intersection"),
        Rect = require("geometry/rect");

    function ToolIntersectionBuilder() {
        Tool.apply(this, arguments);
        this.tempIntersection = null;
        this.mouseDownPos = null;
    }

    ToolIntersectionBuilder.prototype = Object.create(Tool.prototype);

    ToolIntersectionBuilder.prototype.onMouseDown = function(e) {
        this.mouseDownPos = this.getCell(e);
        if (e.shiftKey) {
            var rect = new Rect(this.mouseDownPos.x, this.mouseDownPos.y, 1, 1);
            this.tempIntersection = new Intersection(rect);
        }
    };

    ToolIntersectionBuilder.prototype.onMouseUp = function() {
        if (this.tempIntersection) {
            this.visualizer.world.addIntersection(this.tempIntersection);
            this.tempIntersection = null;
        }
        this.mouseDownPos = null;
    };

    ToolIntersectionBuilder.prototype.onMouseMove = function(e) {
        if (this.tempIntersection) {
            this.tempIntersection.rect = this.visualizer.zoomer.getBoundingBox(
                this.mouseDownPos, this.getCell(e));
        }
    };

    ToolIntersectionBuilder.prototype.onMouseOut = function() {
        this.tempIntersection = null;
        this.mouseDownPos = null;
    };

    ToolIntersectionBuilder.prototype.draw = function() {
        if (this.tempIntersection) {
            this.visualizer.drawIntersection(this.tempIntersection, 0.4);
        }
    };

    return ToolIntersectionBuilder;
});
