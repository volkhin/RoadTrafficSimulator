(function() {
  'use strict';
  define(function() {
    var LanePosition;
    return LanePosition = (function() {
      function LanePosition(car, _lane, position) {
        this.car = car;
        this._lane = _lane;
        this.position = position;
        this.id = window.__nextId++;
        this.free = true;
      }

      LanePosition.property('lane', {
        get: function() {
          return this._lane;
        },
        set: function(lane) {
          this.release();
          this._lane = lane;
          return this.acquire();
        }
      });

      LanePosition.property('relativePosition', {
        get: function() {
          return this.position / this.lane.length();
        }
      });

      LanePosition.prototype.acquire = function() {
        if (this.lane && (this.lane.addCarPosition != null)) {
          this.free = false;
          return this.lane.addCarPosition(this);
        }
      };

      LanePosition.prototype.release = function() {
        if (!this.free && this.lane && this.lane.removeCar) {
          this.free = true;
          return this.lane.removeCar(this);
        }
      };

      LanePosition.prototype.getNext = function() {
        if (this.lane && !this.free) {
          return this.lane.getNext(this);
        }
      };

      LanePosition.prototype.getDistanceToNextCar = function() {
        var next;
        next = this.getNext();
        if (next != null) {
          return next.position - this.position;
        }
        return Infinity;
      };

      return LanePosition;

    })();
  });

}).call(this);
