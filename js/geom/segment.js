(function() {
  'use strict';
  define([], function() {
    var Segment;
    return Segment = (function() {
      function Segment(source, target) {
        this.source = source;
        this.target = target;
      }

      Segment.prototype.center = function() {
        return this.getPoint(0.5);
      };

      Segment.prototype.split = function(n, reverse) {
        var k, order, _i, _j, _k, _len, _ref, _ref1, _results, _results1, _results2;
        order = reverse ? (function() {
          _results = [];
          for (var _i = _ref = n - 1; _ref <= 0 ? _i <= 0 : _i >= 0; _ref <= 0 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this) : (function() {
          _results1 = [];
          for (var _j = 0, _ref1 = n - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; 0 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
          return _results1;
        }).apply(this);
        _results2 = [];
        for (_k = 0, _len = order.length; _k < _len; _k++) {
          k = order[_k];
          _results2.push(this.subsegment(k / n, (k + 1) / n));
        }
        return _results2;
      };

      Segment.prototype.vector = function() {
        return this.target.subtract(this.source);
      };

      Segment.prototype.length = function() {
        return this.vector().length();
      };

      Segment.prototype.direction = function() {
        return this.vector().direction();
      };

      Segment.prototype.getPoint = function(a) {
        return this.source.add(this.vector().mult(a));
      };

      Segment.prototype.subsegment = function(a, b) {
        var end, offset, start;
        offset = this.vector();
        start = this.source.add(offset.mult(a));
        end = this.source.add(offset.mult(b));
        return new Segment(start, end);
      };

      return Segment;

    })();
  });

}).call(this);
