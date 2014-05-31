define(["jquery", "underscore", "segment"], function($, _, Segment) {
    "use strict";

    function Lane(sourceSegment, targetSegment, sourceIntersection, targetIntersection, road) {
        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
        this.sourceIntersection = sourceIntersection;
        this.targetIntersection = targetIntersection;
        this.road = road;
        this.length = this.middleLine.length;
        this.carsPositions = {};
    }

    Lane.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        delete obj.carsPositions;
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

    Lane.prototype.addCarPosition = function(carPosition) {
        this.carsPositions[carPosition.id] = carPosition;
    };

    Lane.prototype._findCarIndex = function(car) {
        for (var i = 0; i < this.carsPositions.length; i++) {
            if (this.carsPositions[i].car === car) {
                return i;
            }
        }
        return -1;
    };

    Lane.prototype.removeCar = function(carPosition) {
        delete this.carsPositions[carPosition.id];
    };

    Lane.prototype.getNext = function(carPosition) {
        if (carPosition.lane !== this) {
            throw Error("CarPosition belongs to another lane!");
        }
        var next = null, bestDistance = Infinity;
        $.each(this.carsPositions, function(index, o) {
            var distance = o.position - carPosition.position;
            if (0 < distance && distance < bestDistance) {
                bestDistance = distance;
                next = o;
            }
        });
        return next;
    };

    return Lane;
});
