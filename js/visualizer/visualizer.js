(function() {
  'use strict';
  define(function(require) {
    var $, Graphics, Point, Rect, ToolHighlighter, ToolIntersectionBuilder, ToolIntersectionMover, ToolMover, ToolRoadBuilder, Visualizer, Zoomer, settings, _;
    $ = require('jquery');
    _ = require('underscore');
    Point = require('geom/point');
    Rect = require('geom/rect');
    Graphics = require('visualizer/graphics');
    ToolMover = require('visualizer/mover');
    ToolIntersectionMover = require('visualizer/intersection-mover');
    ToolIntersectionBuilder = require('visualizer/intersection-builder');
    ToolRoadBuilder = require('visualizer/road-builder');
    ToolHighlighter = require('visualizer/highlighter');
    Zoomer = require('visualizer/zoomer');
    settings = require('settings');
    return Visualizer = (function() {
      function Visualizer(world) {
        this.world = world;
        this.$canvas = $('#canvas');
        this.canvas = this.$canvas[0];
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.carImage = new Image;
        this.carImage.src = 'images/car.png';
        this.zoomer = new Zoomer(20, this, true);
        this.graphics = new Graphics(this.ctx);
        this.toolRoadbuilder = new ToolRoadBuilder(this, true);
        this.toolIntersectionBuilder = new ToolIntersectionBuilder(this, true);
        this.toolHighlighter = new ToolHighlighter(this, true);
        this.toolIntersectionMover = new ToolIntersectionMover(this, true);
        this.toolMover = new ToolMover(this, true);
        this._running = false;
        this.previousTime = 0;
        this.timeFactor = 1;
      }

      Visualizer.prototype.drawIntersection = function(intersection, alpha) {
        var color;
        color = intersection.color || settings.colors.intersection;
        return this.graphics.fillRect(intersection.rect, color, alpha);
      };

      Visualizer.prototype.drawSignals = function(road) {
        var intersection, lights, lightsColors, segment, sideId;
        this.ctx.save();
        lightsColors = [settings.colors.redLight, settings.colors.greenLight];
        intersection = road.target;
        segment = road.targetSide;
        sideId = road.targetSideId;
        lights = intersection.controlSignals.state[sideId];
        this.ctx.lineWidth = 0.1;
        this.graphics.drawSegment(segment.subsegment(0.7, 1.0));
        this.graphics.stroke(lightsColors[lights[0]]);
        this.graphics.drawSegment(segment.subsegment(0.35, 0.65));
        this.graphics.stroke(lightsColors[lights[1]]);
        this.graphics.drawSegment(segment.subsegment(0.0, 0.3));
        this.graphics.stroke(lightsColors[lights[2]]);
        return this.ctx.restore();
      };

      Visualizer.prototype.drawRoad = function(road, alpha) {
        var dashSize, lane, leftLine, line, rightLine, sourceSide, targetSide, _i, _len, _ref;
        if ((road.source == null) || (road.target == null)) {
          throw Error('invalid road');
        }
        sourceSide = road.sourceSide;
        targetSide = road.targetSide;
        this.graphics.polyline(sourceSide.source, sourceSide.target, targetSide.source, targetSide.target);
        this.graphics.fill(settings.colors.road, alpha);
        this.ctx.save();
        _ref = road.lanes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          lane = _ref[_i];
          line = lane.getLeftBorder();
          dashSize = 0.5;
          this.graphics.drawSegment(line);
          this.ctx.lineWidth = 0.05;
          this.ctx.lineDashOffset = 1.5 * dashSize;
          this.ctx.setLineDash([dashSize]);
          this.graphics.stroke(settings.colors.roadMarking);
        }
        this.ctx.restore();
        this.ctx.save();
        this.ctx.lineWidth = 0.05;
        leftLine = road.leftmostLane.getLeftBorder();
        this.graphics.drawSegment(leftLine);
        this.graphics.stroke(settings.colors.roadMarking);
        rightLine = road.rightmostLane.getRightBorder();
        this.graphics.drawSegment(rightLine);
        this.graphics.stroke(settings.colors.roadMarking);
        return this.ctx.restore();
      };

      Visualizer.prototype.drawCar = function(car) {
        var angle, boundRect, center, h, l, rect, s, style;
        angle = car.direction();
        center = car.coords;
        rect = new Rect(0, 0, 1.1 * car.length, 1.7 * car.width);
        rect.center(new Point(0, 0));
        boundRect = new Rect(0, 0, car.length, car.width);
        boundRect.center(new Point(0, 0));
        this.graphics.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(angle);
        h = car.color;
        s = 100;
        l = 90 - 40 * car.speed / car.maxSpeed;
        style = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
        this.graphics.drawImage(this.carImage, rect);
        this.graphics.fillRect(boundRect, style, 0.5);
        return this.graphics.restore();
      };

      Visualizer.prototype.drawGrid = function() {
        var box, i, j, rect, _i, _ref, _ref1, _results;
        box = this.zoomer.getBoundingBox();
        if (box.area() >= 2000) {
          return;
        }
        _results = [];
        for (i = _i = _ref = box.left(), _ref1 = box.right(); _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          _results.push((function() {
            var _j, _ref2, _ref3, _results1;
            _results1 = [];
            for (j = _j = _ref2 = box.top(), _ref3 = box.bottom(); _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
              rect = new Rect(i, j, 0.05, 0.05);
              _results1.push(this.graphics.fillRect(rect, settings.colors.gridPoint));
            }
            return _results1;
          }).call(this));
        }
        return _results;
      };

      Visualizer.prototype.draw = function(time) {
        var car, delta, id, intersection, road, _ref, _ref1, _ref2, _ref3;
        delta = (time - this.previousTime) || 0;
        if (delta > 100) {
          delta = 100;
        }
        this.previousTime = time;
        this.world.onTick(this.timeFactor * delta / 1000);
        this.graphics.clear(settings.colors.background);
        this.graphics.save();
        this.zoomer.transform();
        this.drawGrid();
        _ref = this.world.intersections.all();
        for (id in _ref) {
          intersection = _ref[id];
          this.drawIntersection(intersection, 0.9);
        }
        _ref1 = this.world.roads.all();
        for (id in _ref1) {
          road = _ref1[id];
          this.drawRoad(road, 0.9);
        }
        _ref2 = this.world.roads.all();
        for (id in _ref2) {
          road = _ref2[id];
          this.drawSignals(road);
        }
        _ref3 = this.world.cars.all();
        for (id in _ref3) {
          car = _ref3[id];
          this.drawCar(car);
        }
        this.toolIntersectionBuilder.draw();
        this.toolRoadbuilder.draw();
        this.toolHighlighter.draw();
        this.graphics.restore();
        if (this.running) {
          return window.requestAnimationFrame(this.draw.bind(this));
        }
      };

      Visualizer.property('running', {
        get: function() {
          return this._running;
        },
        set: function(running) {
          if (running) {
            return this.start();
          } else {
            return this.stop();
          }
        }
      });

      Visualizer.prototype.start = function() {
        if (!this._running) {
          this._running = true;
          return this.draw();
        }
      };

      Visualizer.prototype.stop = function() {
        return this._running = false;
      };

      return Visualizer;

    })();
  });

}).call(this);
