define(function(require) {
    "use strict";

    var $ = require("jquery"),
        Point = require("point"),
        Rect = require("rect"),
        Graphics = require("graphics"),
        ToolMover = require("tool-mover"),
        ToolIntersectionMover = require("tool-intersection-mover"),
        ToolIntersectionBuilder = require("tool-intersection-builder"),
        ToolRoadBuilder = require("tool-road-builder"),
        ToolHighlighter = require("tool-highlighter"),
        Zoomer = require("zoomer"),
        settings = require("settings");

    function Visualizer(world) {
        this.world = world;
        this.canvas = $("#canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.carImage = new Image();
        this.carImage.src = "images/car.png";

        this.zoomer = new Zoomer(this.ctx, 20);
        this.graphics = new Graphics(this.ctx);
        this.toolMover = new ToolMover(this, true);
        this.toolIntersectionMover = new ToolIntersectionMover(this, true);
        this.toolIntersectionBuilder = new ToolIntersectionBuilder(this, true);
        this.toolRoadbuilder = new ToolRoadBuilder(this, true);
        this.toolHighlighter = new ToolHighlighter(this, true);
    }

    Visualizer.prototype.drawIntersection = function(intersection, alpha, forcedColor) {
        var color = settings.colors.intersection;
        if (forcedColor) {
            color = forcedColor;
        } else if (intersection.color) {
            color = intersection.color;
        }
        var rect = intersection.rect;

        // draw intersection
        this.graphics.fillRect(rect, color, alpha);
    };

    Visualizer.prototype.drawSignals = function(intersection) {
        // draw control signals
        this.ctx.save();
        var lightsColors = [settings.colors.redLight, settings.colors.greenLight];
        for (var i = 0; i < intersection.roads.length; i++) {
            var road = intersection.roads[i];
            var segment, sideId;
            if (road.target === intersection) {
                segment = road.targetSide;
                sideId = road.targetSideId;
            } else {
                segment = road.sourceSide;
                sideId = road.sourceSideId;
            }
            segment = segment.subsegment(0, 0.5);
            var lights = intersection.state[sideId];
            this.ctx.lineWidth = 0.1;
            this.graphics.drawSegment(segment.subsegment(0.7, 1.0));
            this.graphics.stroke(lightsColors[lights[0]]);
            this.graphics.drawSegment(segment.subsegment(0.35, 0.65));
            this.graphics.stroke(lightsColors[lights[1]]);
            this.graphics.drawSegment(segment.subsegment(0.0, 0.3));
            this.graphics.stroke(lightsColors[lights[2]]);
        }
        this.ctx.restore();
    };

    Visualizer.prototype.drawRoad = function(road, alpha) {
        if (!road.source || !road.target) {
            return;
        }

        var s1 = road.source.rect.getSector(road.target.rect.getCenter()),
            s2 = road.target.rect.getSector(road.source.rect.getCenter());

        var self = this;

        // draw the road
        this.graphics.polyline(s1.source, s1.target, s2.source, s2.target);
        this.graphics.fill(settings.colors.road, alpha);

        var i;

        // draw interlanes
        self.ctx.save();
        for (i = 0; i < road.interlanes.length; i++) {
            var line = road.interlanes[i];
            var dashSize = 0.5;
            this.graphics.drawSegment(line);
            self.ctx.lineWidth = 0.1;
            self.ctx.lineDashOffset = 1.5 * dashSize;
            self.ctx.setLineDash([dashSize]);
            self.graphics.stroke(settings.colors.roadMarking); 
        }
        self.ctx.restore();
    };

    Visualizer.prototype.drawCar = function(car) {
        var angle = car.orientation;
        var center = car.coords;
        var rect = (new Rect(0, 0, 1.1 * car.length, 1.7 * car.width))
            .setCenter(new Point(0, 0));
        var boundRect = (new Rect(0, 0, car.length, car.width))
            .setCenter(new Point(0, 0));

        this.graphics.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(angle);
        var h = car.color;
        var s = 100;
        var l = 90 - 40 * car.speed / car.maxSpeed;
        var style = "hsl(" + h + ", " + s + "%, " + l + "%)";
        this.graphics.drawImage(this.carImage, rect);
        this.graphics.fillRect(boundRect, style, 0.5);
        this.graphics.restore();
    };

    Visualizer.prototype.drawGrid = function() {
        var box = this.zoomer.getBoundingBox();
        for (var i = box.getLeft(); i <= box.getRight(); i++) {
            for (var j = box.getTop(); j <= box.getBottom(); j++) {
                var color = ((i + j) % 2 === 0) ? settings.colors.grid1 : settings.colors.grid2;
                this.graphics.fillRect(new Rect(i, j, 1, 1), color);
            }
        }
    };

    Visualizer.prototype.draw = function() {
        var self = this;
        this.graphics.clear(settings.colors.background);
        this.graphics.save();
        this.zoomer.transform();
        this.drawGrid();
        this.world.intersections.each(function(index, intersection) {
            self.drawIntersection(intersection, 0.9);
        });
        this.world.roads.each(function(index, road) {
            self.drawRoad(road, 0.9);
        });
        this.world.intersections.each(function(index, intersection) {
            self.drawSignals(intersection);
        });
        this.world.cars.each(function(index, car) {
            self.drawCar(car);
        });
        this.toolIntersectionBuilder.draw(); // TODO: all tools
        this.toolRoadbuilder.draw();
        this.toolHighlighter.draw();
        this.graphics.restore();
    };

    return Visualizer;
});
