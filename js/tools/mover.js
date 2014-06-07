define(function(require) {
    "use strict";

    var Tool = require("tools/tool");

    function ToolMover() {
        Tool.apply(this, arguments);
        this.startPosition = null;
    }

    ToolMover.prototype = Object.create(Tool.prototype);

    ToolMover.prototype.contextmenu = function() {
        return false;
    };

    ToolMover.prototype.mousedown = function(e) {
        this.startPosition = this.getPoint(e);
        e.stopImmediatePropagation();
    };

    ToolMover.prototype.mouseup = function() {
        this.startPosition = null;
    };

    ToolMover.prototype.mousemove = function(e) {
        if (this.startPosition) {
            var offset = this.getPoint(e).subtract(this.startPosition);
            this.visualizer.zoomer.moveCenter(offset);
            this.startPosition = this.getPoint(e);
        }
    };

    ToolMover.prototype.mouseout = function() {
        this.startPosition = null;
    };

    return ToolMover;
});
