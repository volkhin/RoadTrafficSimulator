define(function(require) {
  'use strict';

  var Segment = require('geom/segment');

  function Curve(source, target, controlPoint) {
    this.A = source;
    this.B = target;
    this.O = controlPoint;
    this.AB = new Segment(this.A, this.B);
    this.AO = new Segment(this.A, this.O);
    this.OB = new Segment(this.O, this.B);
  }

  Object.defineProperty(Curve.prototype, 'length', {
    get: function() {
      if (!this.O) {
        return this.AB.length();
      }
      // FIXME: it's not the real length
      return this.AB.length();
    }
  });

  Curve.prototype.getPoint = function(a) {
    if (!this.O) {
      return this.AB.getPoint(a);
    }
    var p0 = this.AO.getPoint(a),
            p1 = this.OB.getPoint(a);
    return (new Segment(p0, p1)).getPoint(a);
  };

  Curve.prototype.getDirection = function(a) {
    if (!this.O) {
      return this.AB.direction();
    }
    var p0 = this.AO.getPoint(a),
            p1 = this.OB.getPoint(a);
    return (new Segment(p0, p1)).direction();
  };

  return Curve;
});
