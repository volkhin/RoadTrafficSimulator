define(function(require) {
    "use strict";

    var Point = require("point"),
        Rect = require("rect");

    function Zoomer(ctx, defaultZoom) {
        this.ctx = ctx;
        this.defaultZoom = defaultZoom;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.scale = 1.0;
        this.screnCenter = new Point(this.width / 2, this.height / 2);
        this.center = new Point(this.width / 2, this.height / 2);
    }

    Zoomer.prototype.toCellCoords = function(point) {
        var centerOffset = point.subtract(this.center);
        var scaledOffset = centerOffset.divide(this.scale);
        var result = new Point(
            Math.floor(scaledOffset.x / this.defaultZoom),
            Math.floor(scaledOffset.y / this.defaultZoom)
        );
        return result;
    };

    Zoomer.prototype.getBoundingBox = function(cell1, cell2) {
        cell1 = cell1 || this.toCellCoords(new Point(0, 0));
        cell2 = cell2 || this.toCellCoords(new Point(this.width, this.height));
        var x1 = cell1.x, y1 = cell1.y,
            x2 = cell2.x, y2 = cell2.y;
        var left = Math.min(x1, x2),
            right = Math.max(x1, x2) + 1,
            top = Math.min(y1, y2),
            bottom = Math.max(y1, y2) + 1;
        return new Rect(left, top, right - left, bottom - top);
    };

    Zoomer.prototype.transform = function() {
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.scale(this.defaultZoom, this.defaultZoom);
    };

    Zoomer.prototype.zoom = function(k) {
        k = k || 1.0;
        var offset = this.center.subtract(this.screnCenter);
        this.center = this.screnCenter.add(offset.mult(k / this.scale));
        this.scale = k;
    };

    Zoomer.prototype.zoomIn = function() {
        this.zoom(2.0 * this.scale);
    };

    Zoomer.prototype.zoomNormal = function() {
        this.zoom(1.0);
    };

    Zoomer.prototype.zoomOut = function() {
        this.zoom(0.5 * this.scale);
    };

    Zoomer.prototype.moveCenter = function(offset) {
        this.center = this.center.add(offset);
    };

    return Zoomer;
});
