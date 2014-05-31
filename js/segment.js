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

    Object.defineProperty(Segment.prototype, "vector", {
        get: function() {
            return this.target.subtract(this.source);
        },
    });

    Object.defineProperty(Segment.prototype, "length", {
        get: function() {
            return this.vector.length;
        },
    });

    Segment.prototype.getPoint = function(a) {
        return this.source.add(this.vector.mult(a));
    };

    Segment.prototype.getSplit = function(k, n) {
        var splits = this.split(n);
        return splits[k];
    };

    Segment.prototype.subsegment = function(a, b) {
        var start = this.source.add(this.vector.mult(a)),
            end = this.source.add(this.vector.mult(b));
        return new Segment(start, end);
    };

    Segment.prototype.getOrientation = function() {
        return Math.atan2(this.vector.y, this.vector.x);
    };

    return Segment;
});
