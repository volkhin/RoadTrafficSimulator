define([], function() {
    "use strict";

    function Segment(source, target) {
        this.source = source;
        this.target = target;
    }

    Segment.prototype.getCenter = function() {
        return this.source.add(this.target).divide(2);
    };

    Segment.prototype.split = function(n, reverse) {
        var splits = [];
        for (var i = 0; i < n; i++) {
            var k = reverse ? n - i -1 : i;
            splits.push(this.subsegment(k / n, (k + 1) / n));
        }
        return splits;
    };

    Object.defineProperty(Segment.prototype, "length", {
        get: function() {
            return this.target.subtract(this.source).length;
        },
    });

    Segment.prototype.getSplit = function(k, n) {
        var splits = this.split(n);
        return splits[k];
    };

    Segment.prototype.subsegment = function(a, b) {
        var offset = this.target.subtract(this.source);
        var start = this.source.add(offset.mult(a)),
            end = this.source.add(offset.mult(b));
        return new Segment(start, end);
    };

    Segment.prototype.getOrientation = function() {
        var offset = this.target.subtract(this.source);
        return Math.atan2(offset.y, offset.x);
    };

    return Segment;
});
