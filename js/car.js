define([], function() {
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
        var line = this.lane.getMiddleline();
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

    return Car;
});
