define(["jquery", "underscore", "segment"], function($, _, Segment) {
    "use strict";

    function Lane(sourceSegment, targetSegment, sourceIntersection,
            targetIntersection, road, direction) {
        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
        this.sourceIntersection = sourceIntersection;
        this.targetIntersection = targetIntersection;
        this.road = road;
        this.direction = direction;
        this.leftAdjacent = null;
        this.rightAdjacent = null;
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

    Object.defineProperty(Lane.prototype, "sourceSideId", {
        get: function() {
            return this.direction ? this.road.sourceSideId : this.road.targetSideId;
        },
    });

    Object.defineProperty(Lane.prototype, "targetSideId", {
        get: function() {
            return this.direction ? this.road.targetSideId : this.road.sourceSideId;
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
        return this.middleLine.orientation;
    };

    Lane.prototype.getPoint = function(a) {
        return this.middleLine.getPoint(a);
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
