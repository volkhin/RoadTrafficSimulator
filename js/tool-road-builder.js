define(function(require) {
    "use strict";

    var Tool = require("tool"),
        Road = require("road");

    function ToolRoadBuilder() {
        Tool.apply(this, arguments);
        this.road = null;
    }

    ToolRoadBuilder.prototype = Object.create(Tool.prototype);

    ToolRoadBuilder.prototype.onMouseDown = function(e) {
        var cell = this.getCell(e);
        var hoveredIntersection = this.getHoveredIntersection(cell);
        if (hoveredIntersection) {
            this.road = new Road(hoveredIntersection, null);
        }
    };

    ToolRoadBuilder.prototype.onMouseUp = function(e) {
        if (this.road) {
            var cell = this.getCell(e);
            var hoveredIntersection = this.getHoveredIntersection(cell);
            if (hoveredIntersection && this.road.source.id !== hoveredIntersection.id) {
                this.visualizer.world.addRoad(this.road);
            }
            this.road = null;
        }
    };

    ToolRoadBuilder.prototype.onMouseMove = function(e) {
        var cell = this.getCell(e);
        var hoveredIntersection = this.getHoveredIntersection(cell);
        if (this.road) {
            this.road.target = hoveredIntersection;
        }
    };

    ToolRoadBuilder.prototype.onMouseOut = function() {
        this.road = null;
    };

    ToolRoadBuilder.prototype.draw = function() {
        if (this.road) {
            this.visualizer.drawRoad(this.road, 0.4);
        }
    };

    return ToolRoadBuilder;
});
