define(function(require) {
    "use strict";

    var Tool = require("tools/tool"),
        Road = require("road");

    function ToolRoadBuilder() {
        Tool.apply(this, arguments);
        this.sourceIntersection = null;
        this.road = null;
        this.dualRoad = null;
    }

    ToolRoadBuilder.prototype = Object.create(Tool.prototype);

    ToolRoadBuilder.prototype.mousedown = function(e) {
        var cell = this.getCell(e);
        var hoveredIntersection = this.getHoveredIntersection(cell);
        if (hoveredIntersection) {
            this.sourceIntersection = hoveredIntersection;
        }
    };

    ToolRoadBuilder.prototype.mouseup = function() {
        if (this.road) {
            this.visualizer.world.addRoad(this.road);
        }
        if (this.dualRoad) {
            this.visualizer.world.addRoad(this.dualRoad);
        }
        this.road = null;
        this.dualRoad = null;
        this.sourceIntersection = null;
    };

    ToolRoadBuilder.prototype.mousemove = function(e) {
        var cell = this.getCell(e);
        var hoveredIntersection = this.getHoveredIntersection(cell);
        if (this.sourceIntersection && hoveredIntersection &&
                this.sourceIntersection.id !== hoveredIntersection.id) {
            if (this.road) {
                this.road.target = hoveredIntersection;
                this.dualRoad.source = hoveredIntersection;
            } else {
                this.road = new Road(this.sourceIntersection, hoveredIntersection);
                this.dualRoad = new Road(hoveredIntersection, this.sourceIntersection);
            }
        } else {
            this.road = null;
            this.dualRoad = null;
        }
    };

    ToolRoadBuilder.prototype.mouseout = function() {
        this.road = null;
        this.dualRoad = null;
        this.sourceIntersection = null;
    };

    ToolRoadBuilder.prototype.draw = function() {
        if (this.road) {
            this.visualizer.drawRoad(this.road, 0.4);
        }
        if (this.dualRoad) {
            this.visualizer.drawRoad(this.dualRoad, 0.4);
        }
    };

    return ToolRoadBuilder;
});
