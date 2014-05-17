define(["geometry/point"], function(Point) {
    function Segment(source, target) {
        this.source = source;
        this.target = target;
    }

    return Segment;
});
