(function() {
  'use strict';
  define(function(require) {
    var $, Lane, Segment;
    $ = require('jquery');
    Segment = require('geom/segment');
    return Lane = (function() {
      function Lane(sourceSegment, targetSegment, road) {
        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
        this.road = road;
        this.leftAdjacent = null;
        this.rightAdjacent = null;
        this.leftmostAdjacent = null;
        this.rightmostAdjacent = null;
        this.carsPositions = {};
      }

      Lane.prototype.toJSON = function() {
        var obj;
        obj = $.extend({}, this);
        delete obj.carsPositions;
        return obj;
      };

      Lane.prototype.length = function() {
        return this.middleLine.length();
      };

      Lane.property('middleLine', {
        get: function() {
          return new Segment(this.sourceSegment.center(), this.targetSegment.center());
        }
      });

      Lane.property('sourceSideId', {
        get: function() {
          return this.road.sourceSideId;
        }
      });

      Lane.property('targetSideId', {
        get: function() {
          return this.road.targetSideId;
        }
      });

      Lane.property('isRightmost', {
        get: function() {
          return this === this.rightmostAdjacent;
        }
      });

      Lane.property('isLeftmost', {
        get: function() {
          return this === this.leftmostAdjacent;
        }
      });

      Lane.prototype.getTurnDirection = function(other) {
        var side1, side2, turnNumber;
        if (this.road.target !== other.road.source) {
          throw Error('invalid lanes');
        }
        side1 = this.targetSideId;
        side2 = other.sourceSideId;
        return turnNumber = (side2 - side1 - 1 + 8) % 4;
      };

      Lane.prototype.getLeftBorder = function() {
        return new Segment(this.sourceSegment.source, this.targetSegment.target);
      };

      Lane.prototype.getRightBorder = function() {
        return new Segment(this.sourceSegment.target, this.targetSegment.source);
      };

      Lane.prototype.getDirection = function() {
        return this.middleLine.direction();
      };

      Lane.prototype.getPoint = function(a) {
        return this.middleLine.getPoint(a);
      };

      Lane.prototype.addCarPosition = function(carPosition) {
        if (carPosition.id in this.carsPositions) {
          throw Error('car is already here');
        }
        return this.carsPositions[carPosition.id] = carPosition;
      };

      Lane.prototype.removeCar = function(carPosition) {
        if (!(carPosition.id in this.carsPositions)) {
          throw Error('removing unknown car');
        }
        return delete this.carsPositions[carPosition.id];
      };

      Lane.prototype.getNext = function(carPosition) {
        var bestDistance, distance, id, next, o, _ref;
        if (carPosition.lane !== this) {
          throw Error('car is on other lane');
        }
        next = null;
        bestDistance = Infinity;
        _ref = this.carsPositions;
        for (id in _ref) {
          o = _ref[id];
          distance = o.position - carPosition.position;
          if ((0 < distance && distance < bestDistance)) {
            bestDistance = distance;
            next = o;
          }
        }
        return next;
      };

      return Lane;

    })();
  });

}).call(this);
