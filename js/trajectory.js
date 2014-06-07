define(function(require) {
  'use strict';

  var LanePosition = require('lane-position'),
      Curve = require('geometry/curve');

  function Trajectory(car, lane, position) {
    this.car = car;
    this.current = new LanePosition(this.car, lane, position || 0);
    this.next = new LanePosition(this.car, null, NaN);
    this.temp = new LanePosition(this.car, null, NaN);
    this.isChangingLanes = false;
  }

  Object.defineProperty(Trajectory.prototype, 'lane', {
    get: function() {
      return this.temp.lane ? this.temp.lane : this.current.lane;
    }
  });

  Object.defineProperty(Trajectory.prototype, 'absolutePosition', {
    get: function() {
      return this.temp.lane ? this.temp.position : this.current.position;
    }
  });

  Object.defineProperty(Trajectory.prototype, 'relativePosition', {
    get: function() {
      return this.absolutePosition / this.lane.length;
    }
  });

  Object.defineProperty(Trajectory.prototype, 'direction', {
    get: function() {
      return this.lane.getDirection(this.relativePosition);
    }
  });

  Object.defineProperty(Trajectory.prototype, 'coords', {
    get: function() {
      return this.lane.getPoint(this.relativePosition);
    }
  });

  Trajectory.prototype.getDistanceToNextCar = function() {
    return Math.min(
        this.current.getDistanceToNextCar(),
        this.next.getDistanceToNextCar()
    );
  };

  Trajectory.prototype.getNextIntersection = function() {
    return this.current.lane.road.target;
  };

  Trajectory.prototype.getPreviousIntersection = function() {
    return this.current.lane.road.source;
  };

  Trajectory.prototype.canEnterIntersection = function(nextLane) {
    //TODO: right turn is allowe donly form right lane
    var sourceLane = this.current.lane;
    if (!nextLane) {
      // the car will be removed from the world
      throw Error('It should have been processed before');
      // return true;
    }
    var intersection = sourceLane.road.target;
    var turnNumber = sourceLane.getTurnDirection(nextLane);
    if (turnNumber === 3) {
      throw Error('No U-turn are allowed');
    }
    if (turnNumber === 0 && sourceLane !== sourceLane.leftmostAdjacent) {
      throw Error('Left turns are allowed only from the left lane');
    }
    if (turnNumber === 2 && sourceLane !== sourceLane.rightmostAdjacent) {
      throw Error('Right turns are allowed only from the right lane');
    }
    return intersection.state[sourceLane.road.targetSideId][turnNumber];
  };

  Trajectory.prototype.moveForward = function(distance) {
    if (this.current.position + this.car.length >= this.current.lane.length &&
        !this.isChangingLanes) {
      if (!this.car.nextLane) {
        this.car.alive = false;
      } else if (this.canEnterIntersection(this.car.nextLane)) {
        this.startChangingLanes(this.car.nextLane, 0, true);
        // FIXME: should be done in car model
        this.car.nextLane = null;
        this.car.preferedLane = null;
        this.car.turnNumber = null;
      } else {
        // FIXME: car model should set appropriate acceleration itself
        this.car.speed = 0;
        distance = 0;
      }
    }

    this.current.position += distance;
    this.next.position += distance;
    this.temp.position += distance;

    if (this.isChangingLanes && this.temp.position >= this.temp.lane.length) {
      this.finishChangingLanes();
    }
    if (this.current.lane && !this.isChangingLanes && !this.car.nextLane) {
      this.car.pickNextLane();
    }
  };

  Trajectory.prototype.changeLaneToLeft = function() {
    var nextLane = this.current.lane.leftAdjacent;
    if (!nextLane || nextLane === this.current.lane || this.isChangingLanes) {
      return false;
    }
    var nextPosition = this.current.position + 5 * this.car.length;
    if (nextLane && nextPosition < this.current.lane.length) {
      this.startChangingLanes(nextLane, nextPosition, false);
    } else {
      throw Error('Too late to change lanes');
    }
  };

  Trajectory.prototype.changeLaneToRight = function() {
    var nextLane = this.current.lane.rightAdjacent;
    if (!nextLane || nextLane === this.current.lane || this.isChangingLanes) {
      return false;
    }
    var nextPosition = this.current.position + 5 * this.car.length;
    if (nextLane && nextPosition < this.current.lane.length) {
      this.startChangingLanes(nextLane, nextPosition, false);
    } else {
      throw Error('Too late to change lanes');
    }
  };

  Trajectory.prototype.startChangingLanes = function(
      nextLane, nextPosition, keepOldLine) {
    if (this.isChangingLanes) {
      throw Error('Invalid call order: start/finish changing lanes');
    }

    if (!nextLane) {
      throw Error('No next lane!');
      // this.car.alive = false;
      // return;
    }

    this.isChangingLanes = true;
    this.next.lane = nextLane;
    this.next.position = nextPosition;

    var p1 = this.current.lane.getPoint(this.current.relativePosition),
        p2 = this.next.lane.getPoint(this.next.relativePosition);
    var distance = p2.subtract(p1).length;
    var direction = this.current.lane.middleLine.vector.normalize();
    var control = p1.add(direction.mult(distance / 2));
    this.temp.lane = new Curve(p1, p2, control);
    this.temp.position = 0;
    this.next.position -= this.temp.lane.length;
    if (!keepOldLine) {
      this.current.release();
    }

    return true;
  };

  Trajectory.prototype.finishChangingLanes = function() {
    if (!this.isChangingLanes) {
      throw Error('Invalid call order: start/finish changing lanes');
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
    if (this.current) {
      this.current.release();
    }
    if (this.next) {
      this.next.release();
    }
    if (this.temp) {
      this.temp.release();
    }
  };

  return Trajectory;
});
