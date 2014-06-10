(function() {
  'use strict';
  define(function(requrie) {
    var $, ControlSignals, Intersection, Rect;
    $ = require('jquery');
    ControlSignals = require('model/control-signals');
    Rect = requrie('geom/rect');
    return Intersection = (function() {
      function Intersection(rect) {
        this.rect = rect;
        this.id = window.__nextId++;
        this.roads = [];
        this.inRoads = [];
        this.controlSignals = new ControlSignals;
      }

      Intersection.copy = function(intersection) {
        var result;
        intersection.rect = Rect.copy(intersection.rect);
        result = Object.create(Intersection.prototype);
        result = $.extend(result, intersection);
        result.roads = [];
        result.inRoads = [];
        result.controlSignals = new ControlSignals;
        return result;
      };

      Intersection.prototype.toJSON = function() {
        var obj;
        return obj = {
          id: this.id,
          rect: this.rect
        };
      };

      Intersection.prototype.update = function() {
        var road, _i, _j, _len, _len1, _ref, _ref1, _results;
        _ref = this.roads;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          road = _ref[_i];
          road.update();
        }
        _ref1 = this.inRoads;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          road = _ref1[_j];
          _results.push(road.update());
        }
        return _results;
      };

      return Intersection;

    })();
  });

}).call(this);
