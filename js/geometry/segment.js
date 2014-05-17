define(["geometry/point"], function(Point) {
    function Segment(source, target) {
        this.source = source;
        this.target = target;
    }

    Segment.prototype.getCenter = function() {
        return this.source.add(this.target).divide(2);
    };

    Segment.prototype.split = function(n, reverse) {
        var offset = this.target.subtract(this.source).divide(n);
        var splits = [];
        for (var i = 0; i < n; i++) {
            var k = reverse ? n - i -1 : i;
            var start = this.source.add(offset.mult(k)),
                end = this.source.add(offset.mult(k + 1));
            splits.push(new Segment(start, end));
        }
        return splits;
    };

    Segment.prototype.getSplit = function(k, n) {
        var splits = this.split(n);
        return splits[k];
    };

    return Segment;
});
