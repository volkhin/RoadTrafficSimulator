define(["geometry/point"], function(Point) {
    function Segment(source, target) {
        this.source = source;
        this.target = target;
    }

    Segment.prototype.getCenter = function() {
        return this.source.add(this.target).divide(2);
    };

    return Segment;
});
