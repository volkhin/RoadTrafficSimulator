define(function(require) {
    "use strict";

    var _ = require("underscore"),
        LanePosition = require("lane-position"),
        Curve = require("geometry/curve");

    function Trajectory(car, lane, position) {
        this.car = car;
        this.current = new LanePosition(this.car, lane, position || 0);
        this.next = new LanePosition(this.car, null, NaN);
        this.temp = new LanePosition(this.car, null, NaN);
        this.current.lane = lane;
        this.current.position = position || 0;
        this.isChangingLanes = false;
    }

    Object.defineProperty(Trajectory.prototype, "lane", {
        get: function() {
            return this.temp.lane ? this.temp.lane : this.current.lane;
        },
    });

    Object.defineProperty(Trajectory.prototype, "absolutePosition", {
        get: function() {
            return this.temp.lane ? this.temp.position : this.current.position;
        },
    });

    Object.defineProperty(Trajectory.prototype, "relativePosition", {
        get: function() {
            return this.absolutePosition / this.lane.length;
        },
    });

    Object.defineProperty(Trajectory.prototype, "orientation", {
        get: function() {
            return this.lane.getOrientation(this.relativePosition);
        },
    });

    Object.defineProperty(Trajectory.prototype, "coords", {
        get: function() {
            return this.lane.getPoint(this.relativePosition);
        },
    });

    Trajectory.prototype.getDistanceToNextCar = function() {
        return Math.min(
            this.current.getDistanceToNextCar(),
            this.next.getDistanceToNextCar()
        );
    };

    Trajectory.prototype.getNextIntersection = function() {
        return this.current.lane.targetIntersection;
    };

    Trajectory.prototype.getPreviousIntersection = function() {
        return this.current.lane.sourceIntersection;
    };

    Trajectory.prototype.canEnterIntersection = function() {
        //TODO: right turn is allowe donly form right lane
        var sourceLane = this.current.lane,
            nextLane = this.next.lane;
        if (!nextLane) {
            // the car will be removed from the world
            return true;
            // throw Error("It should have been processed before");
        }
        var intersection = sourceLane.targetIntersection;
        var side1 = sourceLane.targetSideId,
            side2 = nextLane.sourceSideId;
        var turnNumber = (side2 - side1 - 1 + 4) % 4; // 0 - left, 1 - forward, 2 - right
        if (side1 === side2) {
            throw Error("No U-turn are allowed");
            // turnNumber = 0; // same as left turn
        }
        return intersection.state[side1][turnNumber];
    };

    Trajectory.prototype.moveForward = function(distance) {
        if (this.current.position + this.car.length >= this.current.lane.length &&
                !this.isChangingLanes) {
            if (this.canEnterIntersection()) {
                this.next.position = 0;
                this.startChangingLanes(true);
            } else {
                // FIXME: car model should set appropriate acceleration itself
                this.car.speed = 0;
                distance = 0;
            }
        }
        //TODO: stop this random lane changing
        if (!this.isChangingLanes && _.random(1000) === 0) {
            var nextLane = this.current.lane.leftAdjacent || this.current.lane.rightAdjacent;
            var nextPosition = this.current.position + 5 * this.car.length;
            if (nextLane && nextPosition < nextLane.length) {
                this.next.lane = nextLane;
                this.next.position = nextPosition;
                this.startChangingLanes(false);
            }
        }
        this.current.position += distance;
        this.next.position += distance;
        this.temp.position += distance;
        if (this.isChangingLanes && this.temp.position >= this.temp.lane.length) {
            this.finishChangingLanes();
        }
        if (this.current.lane && !this.next.lane) {
            this.car.pickNextLane();
        }
    };

    Trajectory.prototype.startChangingLanes = function(keepOldLine) {
        if (this.isChangingLanes) {
            throw Error("Invalid call order: start/finish changing lanes");
        }

        if (!this.next.lane) {
            // TODO: it shouldn't be here
            this.car.alive = false;
            return;
        }

        this.isChangingLanes = true;
        var p1 = this.current.lane.getPoint(this.current.position / this.current.lane.length),
            p2 = this.next.lane.getPoint(this.next.position / this.next.lane.length);
        var distance = p2.subtract(p1).length;
        var control = p1.add(this.current.lane.middleLine.vector.normalize().mult(distance / 2));
        this.temp.lane = new Curve(p1, p2, control);
        this.temp.position = 0;
        this.next.position -= this.temp.lane.length;
        if (!keepOldLine) {
            this.current.release();
        }
    };

    Trajectory.prototype.finishChangingLanes = function() {
        if (!this.isChangingLanes) {
            throw Error("Invalid call order: start/finish changing lanes");
        }

        if (this.current.lane) {
            this.current.lane.removeCar(this.car);
        }
        this.isChangingLanes = false;
        this.current.lane = this.next.lane;
        this.current.position = this.next.position || 0;
        this.next.lane = null;
        this.next.position = NaN;
        this.temp.lane = null;
        this.temp.position = NaN;
        return this.current.lane;
    };

    return Trajectory;
});
