define(["geometry/point"], function(Point) {
    function Segment(source, target) {
        this.source = source;
        this.target = target;
    }

    Segment.prototype.getCenter = function() {
        return this.source.add(this.target).divide(2);
    };

    Segment.prototype.split = function(k, n) {
        var offset = this.target.subtract(this.source).divide(n);
        var start = this.source.add(offset.mult(k)),
            end = this.source.add(offset.mult(k + 1));
        return new Segment(start, end);
    };

    return Segment;
});
