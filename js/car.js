define(function(require) {
    "use strict";

    var _ = require("underscore");

    var Trajectory = require("trajectory");

    function Car(lane, position) {
        this.id = window.__nextId++;
        this.color = 255 * Math.random();
        this.speed = 0;
        this.width = 0.3;
        this.length = 0.7;
        this.safeDistance = 1.5 * this.length;
        this.maxSpeed = (4 + Math.random())/5 * 4.5;
        this.acceleration = 1.0;
        this.trajectory = new Trajectory(this, lane, position);
        this.alive = true;
        this.preferedLane = 0;
    }

    Object.defineProperty(Car.prototype, "coords", {
        get: function() {
            return this.trajectory.coords;
        },
    });

    Object.defineProperty(Car.prototype, "absolutePosition", {
        get: function() {
            return this.trajectory.current.position;
        },
        set: function(absolutePosition) {
            this.trajectory.current.position = absolutePosition;
        },
    });

    Object.defineProperty(Car.prototype, "relativePosition", {
        get: function() {
            return this.trajectory.current.position / this.trajectory.current.lane.length;
        },
        set: function(relativePosition) {
            this.trajectory.current.position =
                relativePosition * this.trajectory.current.lane.length;
        },
    });

    Object.defineProperty(Car.prototype, "speed", {
        get: function() {
            return this._speed;
        },
        set: function(speed) {
            if (speed < 0) {
                speed = 0;
            } else if (speed > this.maxSpeed) {
                speed = this.maxSpeed;
            }
            this._speed = speed;
        },
    });

    Car.prototype.move = function(delta) {
        if (this.trajectory.getDistanceToNextCar() > this.safeDistance) { // FIXME
            // enough room to move forward
            this.speed += this.acceleration * delta;
        } else {
            this.speed = 0;
        }
        if (this.preferedLane &&
            this.preferedLane !== this.trajectory.current.lane &&
            !this.trajectory.isChangingLanes) {
            if (this.turnNumber === 0) {
                this.trajectory.changeLaneToLeft();
            } else if (this.turnNumber === 2) {
                this.trajectory.changeLaneToRight();
            }
        }
        this.trajectory.moveForward(this.speed * delta);
    };

    Object.defineProperty(Car.prototype, "direction", {
        get: function() {
            return this.trajectory.direction;
        },
    });

    Car.prototype.pickNextLane = function() {
        this.nextLane = null;
        var intersection = this.trajectory.getNextIntersection(),
            previousIntersection = this.trajectory.getPreviousIntersection(),
            currentLane = this.trajectory.current.lane;
        var possibleRoads = intersection.roads.filter(function(x) {
            // FIXME: only 1 statement is enough
            return x.target !== previousIntersection &&
                   x.source !== previousIntersection;
        });
        if (possibleRoads.length !== 0) {
            var nextRoad = _.sample(possibleRoads);
            var laneNumber = _.random(0, nextRoad.lanesNumber - 1);
            this.nextLane = nextRoad.lanes[laneNumber];

            var side1 = currentLane.targetSideId,
                side2 = this.nextLane.sourceSideId;
            this.turnNumber = (side2 - side1 - 1 + 4) % 4; // 0 - left, 1 - forward, 2 - right
            if (this.turnNumber === 0) {
                this.preferedLane = currentLane.leftmostAdjacent;
            } else if (this.turnNumber === 2) {
                this.preferedLane = currentLane.rightAdjacent;
            } else {
                this.preferedLane = null;
            }

            return this.nextLane;
        }
    };

    Car.prototype.release = function() {
        this.trajectory.release();
    };

    return Car;
});
