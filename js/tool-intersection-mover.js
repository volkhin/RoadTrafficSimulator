define(function(require) {
    "use strict";

    var Tool = require("tool");

    function ToolIntersectionMover() {
        Tool.apply(this, arguments);
        this.intersection = null;
    }

    ToolIntersectionMover.prototype = Object.create(Tool.prototype);

    ToolIntersectionMover.prototype.onMouseDown = function(e) {
        if (e.altKey) {
            this.intersection = this.getHoveredIntersection(this.getCell(e));
        }
    };

    ToolIntersectionMover.prototype.onMouseUp = function() {
        this.intersection = null;
    };

    ToolIntersectionMover.prototype.onMouseMove = function(e) {
        if (this.intersection) {
            var cell = this.getCell(e);
            this.intersection.rect.setLeft(cell.x);
            this.intersection.rect.setTop(cell.y);
            this.intersection.update(); // FIXME: should be done automatically
        }
    };

    ToolIntersectionMover.prototype.onMouseOut = function() {
        this.intersection = null;
    };

    return ToolIntersectionMover;
});
