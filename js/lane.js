define(["jquery", "segment"], function($, Segment) {
    function Lane(sourceSegment, targetSegment, sourceIntersection, targetIntersection, road) {
        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
        this.sourceIntersection = sourceIntersection;
        this.targetIntersection = targetIntersection;
        this.road = road;
        this.cars = [];
    }

    Lane.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        delete obj.cars;
        return obj;
    };

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

    Lane.prototype.getOrientation = function() {
        return this.getMiddleline().getOrientation();
    };

    Lane.prototype.addCar = function(car) {
        this.cars.push(car);
    };

    Lane.prototype.removeCar = function(car) {
        var index = this.cars.indexOf(car);
        if (index !== -1) {
            return this.cars.splice(index, 1);
        }
    };

    Lane.prototype.getNextCar = function(car) {
        var index = this.cars.indexOf(car);
        if (index > 0) {
            return this.cars[index - 1];
        }
    };

    return Lane;
});
