(function() {
  'use strict';
  define(function(require) {
    var Car, Trajectory, _;
    _ = require('underscore');
    Trajectory = require('model/trajectory');
    return Car = (function() {
      function Car(lane, position) {
        this.id = window.__nextId++;
        this.color = 255 * Math.random();
        this._speed = 0;
        this.width = 0.3;
        this.length = 0.7;
        this.safeDistance = 1.5 * this.length;
        this.maxSpeed = (4 + Math.random()) / 5 * 4.5;
        this.acceleration = 1;
        this.trajectory = new Trajectory(this, lane, position);
        this.alive = true;
        this.preferedLane = null;
        this.turnNumber = null;
      }

      Car.property('coords', {
        get: function() {
          return this.trajectory.coords;
        }
      });

      Car.property('absolutePosition', {
        get: function() {
          return this.trajectory.current.position;
        },
        set: function(pos) {
          return this.trajectory.current.position = pos;
        }
      });

      Car.property('relativePosition', {
        get: function() {
          var current;
          current = this.trajectory.current;
          return current.position / current.lane.length();
        },
        set: function(pos) {
          return this.trajectory.current.position = pos * this.trajectory.current.lane.length();
        }
      });

      Car.property('speed', {
        get: function() {
          return this._speed;
        },
        set: function(speed) {
          if (speed < 0) {
            speed = 0;
          }
          if (speed > this.maxSpeed) {
            speed = this.maxSpeed;
          }
          return this._speed = speed;
        }
      });

      Car.prototype.direction = function() {
        return this.trajectory.direction;
      };

      Car.prototype.release = function() {
        return this.trajectory.release();
      };

      Car.prototype.move = function(delta) {
        var k;
        if (this.trajectory.getDistanceToNextCar() > this.safeDistance) {
          k = 1 - Math.pow(this.speed / this.maxSpeed, 4);
          this.speed += this.acceleration * delta * k;
        } else {
          this.speed = 0;
        }
        if ((this.preferedLane != null) && this.preferedLane !== this.trajectory.current.lane && !this.trajectory.isChangingLanes) {
          switch (this.turnNumber) {
            case 0:
              this.trajectory.changeLaneToLeft();
              break;
            case 2:
              this.trajectory.changeLaneToRight();
          }
        }
        return this.trajectory.moveForward(this.speed * delta);
      };

      Car.prototype.pickNextLane = function() {
        var currentLane, intersection, laneNumber, nextRoad, possibleRoads, previousIntersection;
        if (this.nextLane) {
          throw Error('next lane is already chosen');
        }
        this.nextLane = null;
        intersection = this.trajectory.getNextIntersection();
        previousIntersection = this.trajectory.getPreviousIntersection();
        currentLane = this.trajectory.current.lane;
        possibleRoads = intersection.roads.filter(function(x) {
          return x.target !== previousIntersection;
        });
        if (possibleRoads.length === 0) {
          return null;
        }
        nextRoad = _.sample(possibleRoads);
        laneNumber = _.random(0, nextRoad.lanesNumber - 1);
        this.nextLane = nextRoad.lanes[laneNumber];
        if (!this.nextLane) {
          throw Error('can not pick next lane');
        }
        this.turnNumber = currentLane.getTurnDirection(this.nextLane);
        this.preferedLane = (function() {
          switch (this.turnNumber) {
            case 0:
              return currentLane.leftmostAdjacent;
            case 2:
              return currentLane.rightmostAdjacent;
            default:
              return null;
          }
        }).call(this);
        return this.nextLane;
      };

      return Car;

    })();
  });

}).call(this);
