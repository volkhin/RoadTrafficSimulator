(function() {
  'use strict';
  define(function(require) {
    var Curve, Segment;
    Segment = require('geom/segment');
    return Curve = (function() {
      function Curve(A, B, O) {
        this.A = A;
        this.B = B;
        this.O = O;
        this.AB = new Segment(this.A, this.B);
        this.AO = new Segment(this.A, this.O);
        this.OB = new Segment(this.O, this.B);
      }

      Curve.prototype.length = function() {
        if (this.O == null) {
          this.AB.length();
        }
        return this.AB.length();
      };

      Curve.prototype.getPoint = function(a) {
        var p0, p1;
        if (this.O == null) {
          this.AB.getPoint(a);
        }
        p0 = this.AO.getPoint(a);
        p1 = this.OB.getPoint(a);
        return (new Segment(p0, p1)).getPoint(a);
      };

      Curve.prototype.getDirection = function(a) {
        var p0, p1;
        if (this.O == null) {
          this.AB.direction();
        }
        p0 = this.AO.getPoint(a);
        p1 = this.OB.getPoint(a);
        return (new Segment(p0, p1)).direction();
      };

      return Curve;

    })();
  });

}).call(this);
