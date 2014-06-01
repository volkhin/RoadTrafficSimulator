define(function(require) {
    "use strict";

    var $ = require("jquery"),
        Tool = require("tool");

    function ToolMover() {
        Tool.apply(this, arguments);
        this.movingCenter = null;

        var self = this;
        $(this.canvas).mousedown(function(e) {
            self.movingCenter = self.getPoint(e);
            console.log("tool mover works!");
        });

        $(this.canvas).mouseup(function() {
            if (self.movingCenter) {
                self.movingCenter = null;
            }
        });

        $(this.canvas).mousemove(function(e) {
            if (self.movingCenter) {
                self.visualizer.zoomer.moveCenter(self.getPoint(e).subtract(self.movingCenter));
                self.movingCenter = self.getPoint(e);
            }
        });

        $(this.canvas).mouseout(function() {
            self.movingCenter = null;
        });

    }

    ToolMover.prototype = Object.create(Tool.prototype);

    return ToolMover;
});
