define(function() {
    "use strict";

    function LanePosition(car, lane, position) {
        this.id = window.__nextId++;
        this.free = true;
        this.car = car;
        this.lane = lane || null;
        this.position = position;
    }

    Object.defineProperty(LanePosition.prototype, "lane", {
        get: function() {
            return this._lane;
        },
        set: function(lane) {
            this.release();
            this._lane = lane;
            this.acquire();
        },
    });

    Object.defineProperty(LanePosition.prototype, "position", {
        get: function() {
            return this._position;
        },
        set: function(position) {
            this._position = position;
        },
    });

    LanePosition.prototype.acquire = function() {
        if (this.lane && this.lane.addCarPosition) {
            this.free = false;
            this.lane.addCarPosition(this);
        }
    };

    LanePosition.prototype.release = function() {
        if (!this.free && this.lane && this.lane.removeCar) {
            this.free = true;
            this.lane.removeCar(this);
        }
    };

    LanePosition.prototype.getNext = function() {
        if (this.lane && !this.free) {
            return this.lane.getNext(this);
        }
    };

    LanePosition.prototype.getDistanceToNextCar = function() {
        var next = this.getNext();
        if (next) {
            return next.position - this.position;
        }
        return Infinity;
    };

    return LanePosition;
});
