define(function(require) {
    "use strict";

    var Tool = require("tools/tool");

    function ToolMover() {
        Tool.apply(this, arguments);
        this.startPosition = null;
    }

    ToolMover.prototype = Object.create(Tool.prototype);

    ToolMover.prototype.onMouseDown = function(e) {
        this.startPosition = this.getPoint(e);
    };

    ToolMover.prototype.onMouseUp = function() {
        this.startPosition = null;
    };

    ToolMover.prototype.onMouseMove = function(e) {
        if (this.startPosition) {
            var offset = this.getPoint(e).subtract(this.startPosition);
            this.visualizer.zoomer.moveCenter(offset);
            this.startPosition = this.getPoint(e);
        }
    };

    ToolMover.prototype.onMouseOut = function() {
        this.startPosition = null;
    };

    return ToolMover;
});
