define(["geometry/segment"], function(Segment) {
    function Lane(sourceSegment, targetSegment) {
        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
    }

    Lane.prototype.getMiddleline = function() {
        return new Segment(
            this.sourceSegment.getCenter(),
            this.targetSegment.getCenter()
        );
    };

    return Lane;
});
