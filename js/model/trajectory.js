(function() {
  'use strict';
  define(function(require) {
    var Curve, LanePosition, Trajectory;
    LanePosition = require('model/lane-position');
    Curve = require('geom/curve');
    return Trajectory = (function() {
      function Trajectory(car, lane, position) {
        this.car = car;
        if (position == null) {
          position = 0;
        }
        this.current = new LanePosition(this.car, lane, position);
        this.next = new LanePosition(this.car);
        this.temp = new LanePosition(this.car);
        this.isChangingLanes = false;
      }

      Trajectory.property('lane', {
        get: function() {
          return this.temp.lane || this.current.lane;
        }
      });

      Trajectory.property('absolutePosition', {
        get: function() {
          if (this.temp.lane != null) {
            return this.temp.position;
          } else {
            return this.current.position;
          }
        }
      });

      Trajectory.property('relativePosition', {
        get: function() {
          return this.absolutePosition / this.lane.length();
        }
      });

      Trajectory.property('direction', {
        get: function() {
          return this.lane.getDirection(this.relativePosition);
        }
      });

      Trajectory.property('coords', {
        get: function() {
          return this.lane.getPoint(this.relativePosition);
        }
      });

      Trajectory.prototype.getDistanceToNextCar = function() {
        return Math.min(this.current.getDistanceToNextCar(), this.next.getDistanceToNextCar());
      };

      Trajectory.prototype.getNextIntersection = function() {
        return this.current.lane.road.target;
      };

      Trajectory.prototype.getPreviousIntersection = function() {
        return this.current.lane.road.source;
      };

      Trajectory.prototype.canEnterIntersection = function(nextLane) {
        var intersection, sideId, sourceLane, turnNumber;
        sourceLane = this.current.lane;
        if (!nextLane) {
          throw Error('no road to enter');
        }
        intersection = this.getNextIntersection();
        turnNumber = sourceLane.getTurnDirection(nextLane);
        if (turnNumber === 3) {
          throw Error('no U-turns are allowed');
        }
        if (turnNumber === 0 && !sourceLane.isLeftmost) {
          throw Error('no left turns from this lane');
        }
        if (turnNumber === 2 && !sourceLane.isRightmost) {
          throw Error('no right turns from this lane');
        }
        sideId = sourceLane.road.targetSideId;
        return intersection.controlSignals.state[sideId][turnNumber];
      };

      Trajectory.prototype.moveForward = function(distance) {
        var laneEnding;
        laneEnding = this.current.position + this.car.length >= this.current.lane.length();
        if (laneEnding && !this.isChangingLanes) {
          switch (false) {
            case !(this.car.nextLane == null):
              this.car.alive = false;
              break;
            case !this.canEnterIntersection(this.car.nextLane):
              this.startChangingLanes(this.car.nextLane, 0, true);
              this.car.nextLane = null;
              this.car.preferedLane = null;
              this.car.turnNumber = null;
              break;
            default:
              this.car.speed = 0;
              distance = 0;
          }
        }
        this.current.position += distance;
        this.next.position += distance;
        this.temp.position += distance;
        if (this.isChangingLanes && this.temp.position >= this.temp.lane.length()) {
          this.finishChangingLanes();
        }
        if (this.current.lane && !this.isChangingLanes && !this.car.nextLane) {
          return this.car.pickNextLane();
        }
      };

      Trajectory.prototype.changeLane = function(nextLane) {
        var nextPosition;
        if (this.isChangingLanes) {
          throw Error('already changing lane');
        }
        if (nextLane == null) {
          throw Error('no next lane');
        }
        if (nextLane === this.lane) {
          throw Error('next lane == current lane');
        }
        if (this.lane.road !== nextLane.road) {
          throw Error('not neighbouring lanes');
        }
        nextPosition = this.current.position + 5 * this.car.length;
        if (!(nextPosition < this.lane.length())) {
          throw Error('too late to change lane');
        }
        return this.startChangingLanes(nextLane, nextPosition, false);
      };

      Trajectory.prototype.changeLaneToLeft = function() {
        return this.changeLane(this.current.lane.leftAdjacent);
      };

      Trajectory.prototype.changeLaneToRight = function() {
        return this.changeLane(this.current.lane.rightAdjacent);
      };

      Trajectory.prototype.startChangingLanes = function(nextLane, nextPosition, keepOldLine) {
        var control, direction, distance, p1, p2;
        if (this.isChangingLanes) {
          throw Error('already changing lane');
        }
        if (nextLane == null) {
          throw Error('no next lane');
        }
        this.isChangingLanes = true;
        this.next.lane = nextLane;
        this.next.position = nextPosition;
        p1 = this.current.lane.getPoint(this.current.relativePosition);
        p2 = this.next.lane.getPoint(this.next.relativePosition);
        distance = p2.subtract(p1).length();
        direction = this.current.lane.middleLine.vector().normalize();
        control = p1.add(direction.mult(distance / 2));
        this.temp.lane = new Curve(p1, p2, control);
        this.temp.position = 0;
        this.next.position -= this.temp.lane.length();
        if (!keepOldLine) {
          return this.current.release();
        }
      };

      Trajectory.prototype.finishChangingLanes = function() {
        if (!this.isChangingLanes) {
          throw Error('no lane changing is going on');
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

      Trajectory.prototype.release = function() {
        var _ref, _ref1, _ref2;
        if ((_ref = this.current) != null) {
          _ref.release();
        }
        if ((_ref1 = this.next) != null) {
          _ref1.release();
        }
        return (_ref2 = this.temp) != null ? _ref2.release() : void 0;
      };

      return Trajectory;

    })();
  });

}).call(this);
