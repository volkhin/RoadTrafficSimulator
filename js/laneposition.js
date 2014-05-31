define([], function() {
    "use strict";

    function LanePosition(car, lane, position) {
        this.id = window.__nextId++;
        this.car = car;
        this.lane = lane || null;
        this.position = position || NaN;
    }

    Object.defineProperty(LanePosition.prototype, "lane", {
        get: function() {
            return this._lane;
        },
        set: function(lane) {
            if (this._lane && this._lane.removeCar) {
                this._lane.removeCar(this);
            }
            if (lane && lane.addCarPosition) {
                lane.addCarPosition(this);
            }
            this._lane = lane;
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

    LanePosition.prototype.getNext = function() {
        if (this.lane) {
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
