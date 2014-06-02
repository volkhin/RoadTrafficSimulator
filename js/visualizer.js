define(function(require) {
    "use strict";

    var $ = require("jquery"),
        Point = require("point"),
        Rect = require("rect"),
        Road = require("road"),
        Graphics = require("graphics"),
        ToolMover = require("tool-mover"),
        ToolIntersectionMover = require("tool-intersection-mover"),
        ToolIntersectionBuilder = require("tool-intersection-builder"),
        Zoomer = require("zoomer");

    function Visualizer(world) {
        this.world = world;
        this.canvas = $("#canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.mouseDownPos = null;
        this.tempRoad = null;
        this.mousePos = null;

        this.carImage = new Image();
        this.carImage.src = "images/car.png";

        // settings
        this.colors = {
            background: "#fff",
            redLight: "hsl(0, 100%, 50%)",
            greenLight: "hsl(120, 100%, 50%)",
            intersection: "#666",
            road: "#666",
            roadMarking: "#eee",
            car: "#333",
            hoveredIntersection: "#3d4c53",
            tempRoad: "#aaa",
            grid1: "#fff",//"#70b7ba",
            grid2: "#f9f9f9", //"#70b7ba",
            hoveredGrid: "#f4e8e1",
        };

        this.zoomer = new Zoomer(this.ctx, 20);
        this.graphics = new Graphics(this.ctx);
        this.toolMover = new ToolMover(this);
        this.toolMover.bind();
        this.toolIntersectionMover = new ToolIntersectionMover(this);
        this.toolIntersectionMover.bind();
        this.toolIntersectionBuilder = new ToolIntersectionBuilder(this);
        this.toolIntersectionBuilder.bind();

        var self = this;

        $(this.canvas).mousedown(function(e) {
            var cell = self.getCell(e);
            self.mouseDownPos = cell;
            var hoveredIntersection = self.getHoveredIntersection(cell);
            if (hoveredIntersection) {
                self.tempRoad = new Road(hoveredIntersection, null);
            }
        });

        $(this.canvas).mouseup(function(e) {
            var cell = self.getCell(e);
            if (self.tempRoad) {
                var hoveredIntersection = self.getHoveredIntersection(cell);
                if (hoveredIntersection && self.tempRoad.source.id !== hoveredIntersection.id) {
                    self.world.addRoad(self.tempRoad);
                }
                self.tempRoad = null;
            }
            self.mouseDownPos = null;
        });

        $(this.canvas).mousemove(function(e) {
            var cell = self.getCell(e);
            var hoveredIntersection = self.getHoveredIntersection(cell);
            self.mousePos = cell;
            self.world.intersections.each(function(index, intersection) {
                intersection.color = null; }
            );
            if (hoveredIntersection) {
                hoveredIntersection.color = self.colors.hoveredIntersection;
            }
            if (self.tempRoad) {
                self.tempRoad.target = hoveredIntersection;
            }
        });

        $(this.canvas).mouseout(function() {
            self.mouseDownPos = null;
            self.tempRoad = null;
            self.mousePos = null;
        });
    }

    Visualizer.prototype.getPoint = function(e) {
        var point = new Point(
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
        );
        return point;
    };

    Visualizer.prototype.getCell = function(e) {
        return this.zoomer.toCellCoords(this.getPoint(e));
    };

    Visualizer.prototype.drawIntersection = function(intersection, alpha, forcedColor) {
        var color = this.colors.intersection;
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
        var lightsColors = [this.colors.redLight, this.colors.greenLight];
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
        this.graphics.fill(this.colors.road, alpha);

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
            self.graphics.stroke(self.colors.roadMarking); 
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
                var color = ((i + j) % 2 === 0) ? this.colors.grid1 : this.colors.grid2;
                this.graphics.fillRect(new Rect(i, j, 1, 1), color);
            }
        }
    };

    Visualizer.prototype.drawHighlightedCell = function() {
        if (this.mousePos) {
            this.ctx.fillStyle = this.colors.hoveredGrid;
            var cell = this.mousePos;
            this.ctx.fillRect(cell.x, cell.y, 1, 1);
        }
    };

    Visualizer.prototype.getHoveredIntersection = function(cell) {
        var cellRect = new Rect(cell.x, cell.y, 1, 1);
        var intersections = this.world.intersections.all();
        for (var key in intersections) {
            if (intersections.hasOwnProperty(key)) {
                var intersection = intersections[key];
                if (intersection.rect.containsRect(cellRect)) {
                    return intersection;
                }
            }
        }
    };

    Visualizer.prototype.draw = function() {
        var self = this;
        this.graphics.clear(this.colors.background);
        this.graphics.save();
        this.zoomer.transform();
        this.drawGrid();
        this.drawHighlightedCell();
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
        if (self.tempRoad) {
            self.drawRoad(self.tempRoad, 0.4);
        }
        this.toolIntersectionBuilder.draw(); // TODO: all tools
        this.graphics.restore();
    };

    return Visualizer;
});
