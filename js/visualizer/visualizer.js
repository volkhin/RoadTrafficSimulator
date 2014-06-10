define(function(require) {
  'use strict';

  var $ = require('jquery'),
      _ = require('underscore'),
      Point = require('geom/point'),
      Rect = require('geom/rect'),
      Graphics = require('visualizer/graphics'),
      ToolMover = require('visualizer/mover'),
      ToolIntersectionMover = require('visualizer/intersection-mover'),
      ToolIntersectionBuilder = require('visualizer/intersection-builder'),
      ToolRoadBuilder = require('visualizer/road-builder'),
      ToolHighlighter = require('visualizer/highlighter'),
      Zoomer = require('visualizer/zoomer'),
      settings = require('settings');

  function Visualizer(world) {
    this.world = world;
    this.$canvas = $('#canvas');
    this.canvas = this.$canvas[0];
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.carImage = new Image();
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
    this.timeFactor = 1.0;
  }

  Visualizer.prototype.drawIntersection = function(intersection, alpha, color) {
    if (intersection.color) {
      color = intersection.color;
    } else {
      color = settings.colors.intersection;
    }
    this.graphics.fillRect(intersection.rect, color, alpha);
  };

  Visualizer.prototype.drawSignals = function(road) {
    // draw control signals
    this.ctx.save();
    var lightsColors = [settings.colors.redLight, settings.colors.greenLight];
    var intersection = road.target;
    var segment = road.targetSide;
    var sideId = road.targetSideId;
    var lights = intersection.controlSignals.state[sideId];

    this.ctx.lineWidth = 0.1;
    this.graphics.drawSegment(segment.subsegment(0.7, 1.0));
    this.graphics.stroke(lightsColors[lights[0]]);
    this.graphics.drawSegment(segment.subsegment(0.35, 0.65));
    this.graphics.stroke(lightsColors[lights[1]]);
    this.graphics.drawSegment(segment.subsegment(0.0, 0.3));
    this.graphics.stroke(lightsColors[lights[2]]);
    this.ctx.restore();
  };

  Visualizer.prototype.drawRoad = function(road, alpha) {
    if (!road.source || !road.target) {
      throw Error('Invalid road');
    }

    var sourceSide = road.sourceSide, targetSide = road.targetSide;

    // draw the road
    this.graphics.polyline(sourceSide.source, sourceSide.target,
        targetSide.source, targetSide.target);
    this.graphics.fill(settings.colors.road, alpha);

    var i;

    // draw interlanes
    this.ctx.save();
    for (i = 0; i + 1 < road.lanes.length; i++) {
      var line = road.lanes[i].getLeftBorder();
      var dashSize = 0.5;
      this.graphics.drawSegment(line);
      this.ctx.lineWidth = 0.05;
      this.ctx.lineDashOffset = 1.5 * dashSize;
      this.ctx.setLineDash([dashSize]);
      this.graphics.stroke(settings.colors.roadMarking);
    }
    this.ctx.restore();

    // draw road single lines
    this.ctx.save();
    this.ctx.lineWidth = 0.05;
    var leftLine = road.leftmostLane.getLeftBorder();
    this.graphics.drawSegment(leftLine);
    this.graphics.stroke(settings.colors.roadMarking);
    var rightLine = road.rightmostLane.getRightBorder();
    this.graphics.drawSegment(rightLine);
    this.graphics.stroke(settings.colors.roadMarking);
    this.ctx.restore();
  };

  Visualizer.prototype.drawCar = function(car) {
    var angle = car.direction();
    var center = car.coords;
    var rect = new Rect(0, 0, 1.1 * car.length, 1.7 * car.width);
    rect.center(new Point(0, 0))
    var boundRect = new Rect(0, 0, car.length, car.width);
    boundRect.center(new Point(0, 0))

    this.graphics.save();
    this.ctx.translate(center.x, center.y);
    this.ctx.rotate(angle);
    var h = car.color;
    var s = 100;
    var l = 90 - 40 * car.speed / car.maxSpeed;
    var style = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    this.graphics.drawImage(this.carImage, rect);
    this.graphics.fillRect(boundRect, style, 0.5);
    this.graphics.restore();
  };

  Visualizer.prototype.drawGrid = function() {
    var box = this.zoomer.getBoundingBox();
    if (box.area() >= 2000) {
      return;
    }
    for (var i = box.left; i <= box.left + box.width; i++) {
      for (var j = box.top; j <= box.bottom; j++) {
        var rect = new Rect(i, j, 0.05, 0.05);
        this.graphics.fillRect(rect, settings.colors.gridPoint);
      }
    }
  };

  Visualizer.prototype.draw = function(time) {
    var delta = (time - this.previousTime) || 0;
    if (delta > 100) {
      delta = 100;
    }
    this.previousTime = time;
    this.world.onTick(this.timeFactor * delta / 1000.0);

    this.graphics.clear(settings.colors.background);
    this.graphics.save();
    this.zoomer.transform();
    this.drawGrid();
    _.each(this.world.intersections.all(), function(intersection) {
      this.drawIntersection(intersection, 0.9);
    }, this);
    _.each(this.world.roads.all(), function(road) {
      this.drawRoad(road, 0.9);
    }, this);
    _.each(this.world.roads.all(), function(road) {
      this.drawSignals(road);
    }, this);
    _.each(this.world.cars.all(), function(car) {
      this.drawCar(car);
    }, this);
    this.toolIntersectionBuilder.draw(); // TODO: all tools
    this.toolRoadbuilder.draw();
    this.toolHighlighter.draw();
    this.graphics.restore();

    if (this.running) {
      window.requestAnimationFrame(this.draw.bind(this));
    }
  };


  Object.defineProperty(Visualizer.prototype, 'running', {
    get: function() {
      return this._running;
    },
    set: function(running) {
      if (running === true) {
        this.start();
      } else if (running === false) {
        this.stop();
      }
    }
  });

  Visualizer.prototype.start = function() {
    if (!this._running) {
      this._running = true;
      this.draw();
    }
  };

  Visualizer.prototype.stop = function() {
    this._running = false;
  };

  return Visualizer;
});
