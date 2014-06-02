define(function(require) {
    "use strict";

    var Tool = require("tool"),
        Rect = require("rect");

    function ToolHighlighter() {
        Tool.apply(this, arguments);
        this.mousePos = null;
    }

    ToolHighlighter.prototype = Object.create(Tool.prototype);

    ToolHighlighter.prototype.onMouseDown = function() {
    };

    ToolHighlighter.prototype.onMouseUp = function() {
    };

    ToolHighlighter.prototype.onMouseMove = function(e) {
        var cell = this.getCell(e);
        var hoveredIntersection = this.getHoveredIntersection(cell);
        this.mousePos = cell;
        this.visualizer.world.intersections.each(function(index, intersection) {
            intersection.color = null;
        });
        if (hoveredIntersection) {
            hoveredIntersection.color = this.visualizer.colors.hoveredIntersection;
        }
    };

    ToolHighlighter.prototype.onMouseOut = function() {
        this.mousePos = null;
    };

    ToolHighlighter.prototype.draw = function() {
        if (this.mousePos) {
            var cell = new Rect(this.mousePos.x, this.mousePos.y, 1, 1);
            this.visualizer.graphics.fillRect(cell, this.visualizer.colors.hoveredGrid, 0.5);
        }
    };

    return ToolHighlighter;
});
