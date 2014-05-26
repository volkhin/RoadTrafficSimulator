define(["segment"], function(Segment) {
    function Lane(sourceSegment, targetSegment, sourceJunction, targetJunction, road) {
        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
        this.sourceJunction = sourceJunction;
        this.targetJunction = targetJunction;
        this.road = road;
    }

    Lane.prototype.getMiddleline = function() {
        return new Segment(
            this.sourceSegment.getCenter(),
            this.targetSegment.getCenter()
        );
    };

    Lane.prototype.getLeftBorder = function() {
        return new Segment(
            this.sourceSegment.source,
            this.targetSegment.target
        );
    };

    Lane.prototype.getRightBorder = function() {
        return new Segment(
            this.sourceSegment.target,
            this.targetSegment.source
        );
    };

    return Lane;
});
