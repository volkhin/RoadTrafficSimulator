define(["jquery", "segment"], function($, Segment) {
    "use strict";

    function Lane(sourceSegment, targetSegment, sourceIntersection, targetIntersection, road) {
        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
        this.sourceIntersection = sourceIntersection;
        this.targetIntersection = targetIntersection;
        this.road = road;
        this.length = this.middleLine.length;
        this.cars = [];
    }

    Lane.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        delete obj.cars;
        return obj;
    };

    Object.defineProperty(Lane.prototype, "middleLine", {
        get: function() {
            return new Segment(
                this.sourceSegment.getCenter(),
                this.targetSegment.getCenter()
            );
        },
    });

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
        return this.middleLine.getOrientation();
    };

    Lane.prototype.canLeave = function() {
        return this.targetIntersection.state[this.road.targetSideId];
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
