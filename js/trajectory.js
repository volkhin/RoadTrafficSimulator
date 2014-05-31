define(["underscore", "lane", "laneposition"], function(_, Lane, LanePosition) {
    "use strict";

    function Trajectory(car, lane, position) {
        this.car = car;
        this.current = new LanePosition(this.car, lane, position || 0);
        this.next = new LanePosition(this.car, null, NaN);
        this.temp = new LanePosition(this.car, null, NaN);
        this.current.lane = lane;
        this.current.position = position || 0;
        if (this.current.lane) {
            this.pickNextLane();
        }
        this.isChangingLanes = false;
    }

    Object.defineProperty(Trajectory.prototype, "lane", {
        get: function() {
            return this.temp.lane ? this.temp.lane : this.current.lane;
        },
    });

    Object.defineProperty(Trajectory.prototype, "position", {
        get: function() {
            return this.temp.lane ? this.temp.position : this.current.position;
        },
    });

    Trajectory.prototype.getCoords = function() {
        var line = this.lane.middleLine;
        var source = line.source, target = line.target;
        var offset = target.subtract(source);
        var relativePosition = this.position / this.lane.middleLine.length;
        return source.add(offset.mult(relativePosition));
    };

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
            // if (this.current.lane.canLeave()) {
        // var side1 = this.road.targetSideId;
        var sourceLane = this.current.lane,
            nextLane = this.next.lane;
        if (!nextLane) {
            // the car will be removed from the world
            return true;
            // throw Error("It should have been processed before");
        }
        var intersection = sourceLane.targetIntersection;
        var side1 = sourceLane.targetSideId, // FIXME
            side2 = nextLane.sourceSideId;
        var turnNumber = (side2 - side1 - 1 + 4) % 4; // 0 - left, 1 - forward, 2 - right
        if (side1 === side2) {
            throw Error("No U-turn are allowed");
            // turnNumber = 0; // same as left turn
        }
        return intersection.state[side1][turnNumber];
    };

    Trajectory.prototype.moveForward = function(distance) {
        if (this.current.position >= this.current.lane.length && !this.isChangingLanes) {
            // if (this.current.lane.canLeave()) {
            if (this.canEnterIntersection()) {
                this.startChangingLanes();
            } else {
                // FIXME: car model should set appropriate acceleration itself
                this.car.speed = 0;
                distance = 0;
            }
        }
        this.current.position += distance;
        this.next.position += distance;
        this.temp.position += distance;
        if (this.next.position >= 0) {
            this.finishChangingLanes();
        }
    };

    Trajectory.prototype.startChangingLanes = function() {
        if (this.isChangingLanes) {
            throw Error("Invalid call order: start/finish changing lanes");
        }

        if (!this.next.lane) {
            // TODO: it shouldn't be here
            this.car.alive = false;
        }

        this.isChangingLanes = true;
        this.temp.lane = new Lane(
            this.current.lane.targetSegment,
            this.next.lane.sourceSegment,
            this.current.lane.targetIntersection,
            this.next.lane.sourceIntersection
        );
        this.temp.position = 0;
        this.next.position = -this.temp.lane.middleLine.length;
        // if (this.next.lane) {
            // this.next.lane.addCarPosition(this.next);
        // }
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
        if (this.current.lane) {
            this.pickNextLane();
        }
        this.temp.lane = null;
        this.temp.position = NaN;
        return this.current.lane;
    };

    Trajectory.prototype.pickNextLane = function() {
        if (this.next.lane) {
            return this.next.lane;
        }

        var intersection = this.getNextIntersection(),
            previousIntersection = this.getPreviousIntersection();
        var possibleRoads = intersection.roads.filter(function(x) {
            return x.target !== previousIntersection &&
                   x.source !== previousIntersection;
        });
        if (possibleRoads.length !== 0) {
            var nextRoad = _.sample(possibleRoads);
            var laneNumber;
            if (intersection === nextRoad.source) {
                laneNumber = _.random(0, nextRoad.lanesNumber / 2 - 1);
            } else {
                laneNumber = _.random(nextRoad.lanesNumber / 2, nextRoad.lanesNumber - 1);
            }
            this.next.lane = nextRoad.lanes[laneNumber];
            this.next.position = NaN;
            return this.next.lane;
        }
    };

    return Trajectory;
});
