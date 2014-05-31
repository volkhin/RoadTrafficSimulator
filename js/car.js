define(["underscore"], function(_) {
    "use strict";

    function Car(lane, position) {
        this.id = window.__nextId++;
        this.color = 255 * Math.random();
        this.speed = 0;
        this.width = 5;
        this.length = 10;
        this.maxSpeed = (4 + Math.random()) / 5; // 0.8 - 1.0
        this.acceleration = 0.02;
        this.moveToLane(lane, position);
    }

    Car.prototype.getCenter = function() {
        var line = this.lane.middleLine;
        var source = line.source, target = line.target;
        var offset = target.subtract(source);
        return source.add(offset.mult(this.relativePosition));
    };

    Object.defineProperty(Car.prototype, "absolutePosition", {
        get: function() {
            return this._absolutePosition;
        },
        set: function(absolutePosition) {
            this._absolutePosition = absolutePosition;
        },
    });

    Object.defineProperty(Car.prototype, "relativePosition", {
        get: function() {
            return this._absolutePosition / this.lane.length;
        },
        set: function(relativePosition) {
            this._absolutePosition = relativePosition * this.lane.length;
        },
    });

    Car.prototype.moveToLane = function(lane, position) {
        if (this.lane) {
            this.lane.removeCar(this);
        }
        if (lane) {
            lane.addCar(this);
        }
        this.lane = lane;
        this.absolutePosition = position || 0;
    };

    Car.prototype.getNextCar = function() {
        return this.lane.getNextCar(this);
    };

    Car.prototype.getDistanceToNextCar = function() {
        var nextCar = this.getNextCar();
        if (!nextCar) {
            return Infinity;
        }
        return nextCar.absolutePosition - this.absolutePosition;
    };

    Car.prototype.pickNextRoad = function() {
        var intersection = this.lane.targetIntersection,
            previousIntersection = this.lane.sourceIntersection;
        var possibleRoads = intersection.roads.filter(function(x) {
            return x.target !== previousIntersection &&
                   x.source !== previousIntersection;
        });
        if (possibleRoads.length !== 0) {
            return _.sample(possibleRoads);
        }
    };

    Car.prototype.move = function() {
        if (this.getDistanceToNextCar() > 15 && this.relativePosition < 1) { // FIXME
            this.speed += this.acceleration;
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            }
            this.absolutePosition += this.speed;
        } else {
            this.speed = 0;
        }
        var intersection = null, previousIntersection = null;
        if (this.relativePosition >= 1) {
            previousIntersection = this.lane.sourceIntersection;
            intersection = this.lane.targetIntersection;
            this.relativePosition = 1;
        }
        if (intersection) {
            if (this.lane.canLeave()) {
                var nextRoad = this.pickNextRoad();
                if (!nextRoad) {
                    // removing car from the world
                    this.moveToLane(null);
                    // self.cars.pop(car.id); // FIXME
                    this.removed = true;
                } else {
                    if (intersection === nextRoad.source) {
                        this.moveToLane(nextRoad.lanes[0]);
                    } else {
                        this.moveToLane(nextRoad.lanes[nextRoad.lanesNumber - 1]);
                    }
                }
            } else {
                this.speed = 0;
            }
        }
    };

    return Car;
});
