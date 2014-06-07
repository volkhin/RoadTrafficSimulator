define(function(require) {
  'use strict';

  var $ = require('jquery'),
      _ = require('underscore'),
      Lane = require('lane');

  function Road(source, target) {
    this.id = window.__nextId++;
    this.source = source;
    this.target = target;
    this.lanes = [];
    this.lanesNumber = undefined;
    this.update();
  }

  Road.copy = function(road) {
    var result = Object.create(Road.prototype);
    $.extend(result, road);
    result.lanes = result.lanes || [];
    return result;
  };

  Road.prototype.toJSON = function() {
    var obj = $.extend({}, this);
    obj.source = obj.source.id;
    obj.target = obj.target.id;
    obj = _.pick(obj, ['id', 'source', 'target']);
    return obj;
  };

  Object.defineProperty(Road.prototype, 'length', {
    get: function() {
      if (this.sourceSide && this.targetSide) {
        var a = this.sourceSide.source,
                    b = this.targetSide.target;
        return b.subtract(a).length;
      }
      return NaN;
    }
  });

  Object.defineProperty(Road.prototype, 'leftmostLane', {
    get: function() {
      return this.lanes[this.lanesNumber - 1];
    }
  });

  Object.defineProperty(Road.prototype, 'rightmostLane', {
    get: function() {
      return this.lanes[0];
    }
  });

  Road.prototype.update = function() {
    if (!this.source || !this.target) {
      throw Error('Incomplete road');
    }

    this.sourceSideId = this.source.rect .getSectorId(this.target.rect.center);
    this.sourceSide = this.source.rect.getSide(this.sourceSideId)
      .subsegment(0.5, 1.0);
    this.targetSideId = this.target.rect .getSectorId(this.source.rect.center);
    this.targetSide = this.target.rect.getSide(this.targetSideId)
      .subsegment(0, 0.5);
    if (typeof this.lanesNumber === 'undefined') {
      this.lanesNumber = Math.floor(
          Math.min(this.sourceSide.length, this.targetSide.length));
    }
    var sourceSplits = this.sourceSide.split(this.lanesNumber, true),
            targetSplits = this.targetSide.split(this.lanesNumber);

    for (var i = 0; i < this.lanesNumber; i++) {
      if (!this.lanes[i]) {
        this.lanes[i] = new Lane(
            sourceSplits[i], targetSplits[i], this.source, this.target, this
            );
      } else {
        this.lanes[i].sourceSegment = sourceSplits[i];
        this.lanes[i].targetSegment = targetSplits[i];
      }
      this.lanes[i].leftAdjacent = this.lanes[i + 1];
      this.lanes[i].rightAdjacent = this.lanes[i - 1];
      this.lanes[i].leftmostAdjacent = this.lanes[this.lanesNumber - 1];
      this.lanes[i].rightmostAdjacent = this.lanes[0];
    }
  };

  return Road;
});
