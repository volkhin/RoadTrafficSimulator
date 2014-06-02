define(function(require) {
    "use strict";

    var $ = require("jquery"),
        Segment = require("geometry/segment");

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
        this.carsPositions = {};
    }

    Lane.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        delete obj.carsPositions;
        return obj;
    };

    Object.defineProperty(Lane.prototype, "length", {
        get: function() {
            return this.middleLine.length;
        },
    });

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
        if (carPosition.id in this.carsPositions) {
            throw Error("Car is already on this lane");
        }
        this.carsPositions[carPosition.id] = carPosition;
    };

    Lane.prototype.removeCar = function(carPosition) {
        if (!(carPosition.id in this.carsPositions)) {
            throw Error("Trying to delete non-existing car from the lane");
        }
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
