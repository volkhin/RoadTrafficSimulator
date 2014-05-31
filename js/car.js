define(["underscore", "trajectory"], function(_, Trajectory) {
    "use strict";

    function Car(lane, position) {
        this.id = window.__nextId++;
        this.color = 255 * Math.random();
        this.speed = 0;
        this.width = 5;
        this.length = 10;
        this.safeDistance = 1.5 * this.length;
        this.maxSpeed = (4 + Math.random()) / 5; // 0.8 - 1.0
        this.acceleration = 0.02;
        this.trajectory = new Trajectory(this, lane, position);
        this.alive = true;
    }

    Car.prototype.getCenter = function() {
        return this.trajectory.getCoords();
    };

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

    Car.prototype.move = function() {
        if (this.trajectory.getDistanceToNextCar() > this.safeDistance) { // FIXME
            // enough room to move forward
            this.speed += this.acceleration;
        } else {
            this.speed = 0;
        }
        this.trajectory.moveForward(this.speed);
        if (!this.trajectory.current.lane) {
            this.alive = false;
        }
    };

    Object.defineProperty(Car.prototype, "orientation", {
        get: function() {
            return this.trajectory.lane.middleLine.getOrientation();
        },
    });

    return Car;
});
