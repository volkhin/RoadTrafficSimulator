define(function(require) {
    "use strict";

    var $ = require("jquery"),
        Intersection = require("intersection"),
        Point = require("point"),
        Rect = require("rect"),
        Road = require("road"),
        Graphics = require("graphics");

    function Visualizer(world) {
        this.world = world;
        this.canvas = $("#canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.mouseDownPos = null;
        this.tempRoad = null;
        this.tempIntersection = null;
        this.dragIntersection = null;
        this.mousePos = null;
        this.graphics = new Graphics(this.ctx);

        // settings
        this.gridStep = 20;
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
            grid: "#70b7ba",
            hoveredGrid: "#f4e8e1",
        };
        var self = this;

        $(this.canvas).mousedown(function(e) {
            var point = self.getPoint(e);
            self.mouseDownPos = point;
            var hoveredIntersection = self.getHoveredIntersection(point);
            if (e.shiftKey) {
                var rect = self.getBoundGridRect(self.mouseDownPos, self.mousePos);
                self.tempIntersection = new Intersection(rect);
            } else if (e.altKey) {
                self.dragIntersection = hoveredIntersection;
            } else if (hoveredIntersection) {
                self.tempRoad = new Road(hoveredIntersection, null);
            }
        });

        $(this.canvas).mouseup(function(e) {
            var point = self.getPoint(e);
            if (self.tempRoad) {
                var hoveredIntersection = self.getHoveredIntersection(point);
                if (hoveredIntersection && self.tempRoad.source.id !== hoveredIntersection.id) {
                    var road1 = new Road(self.tempRoad.source, hoveredIntersection);
                    self.world.addRoad(road1);
                    // var road2 = new Road(hoveredIntersection, self.tempRoad.source);
                    // self.world.addRoad(road2);
                }
                self.tempRoad = null;
            }
            if (self.tempIntersection) {
                self.world.addIntersection(self.tempIntersection);
                self.tempIntersection = null;
            }
            self.mouseDownPos = null;
            self.dragIntersection = null;
        });

        $(this.canvas).mousemove(function(e) {
            var point = self.getPoint(e);
            var hoveredIntersection = self.getHoveredIntersection(point);
            self.mousePos = point;
            self.world.intersections.each(function(index, intersection) {
                intersection.color = null; }
            );
            if (hoveredIntersection) {
                hoveredIntersection.color = self.colors.hoveredIntersection;
            }
            if (self.tempRoad) {
                self.tempRoad.target = hoveredIntersection;
            }
            if (self.dragIntersection) {
                var gridPoint = self.getClosestGridPoint(point);
                self.dragIntersection.rect.setLeft(gridPoint.x);
                self.dragIntersection.rect.setTop(gridPoint.y);
                self.dragIntersection.update(); // FIXME: should be done automatically
            }
            if (self.tempIntersection) {
                self.tempIntersection.rect = self.getBoundGridRect(
                    self.mouseDownPos, self.mousePos);
            }
        });

        this.canvas.addEventListener("mouseout", function() {
            self.mouseDownPos = null;
            self.tempRoad = null;
            self.dragIntersection = null;
            self.mousePos = null;
            self.tempIntersection = null;
        });

    }

    Visualizer.prototype.getPoint = function(e) {
        var point = new Point(
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
        );
        return point;
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
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.graphics.fillRect(rect, color);
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
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.graphics.polyline(s1.source, s1.target, s2.source, s2.target);
        this.graphics.fill(this.colors.road);
        this.ctx.restore();

        var i;
        // draw lanes
        self.ctx.save();
        for (i = 0; i < road.lanes.length; i++) {
            var lane = road.lanes[i];
            var intersection = lane.targetIntersection;
            var segment = lane.targetSegment.subsegment(0.2, 0.8);
            this.graphics.drawSegment(segment);
            self.ctx.lineWidth = 3;
            if (intersection.state[road.targetSideId] === Intersection.STATE.RED) {
                self.graphics.stroke(self.colors.redLight);
            } else {
                self.graphics.stroke(self.colors.greenLight);
            }
        }
        self.ctx.restore();

        // draw interlanes
        self.ctx.save();
        for (i = 0; i < road.interlanes.length; i++) {
            var line = road.interlanes[i];
            var dashSize = self.gridStep / 2;
            this.graphics.drawSegment(line);
            self.ctx.lineDashOffset = 1.5 * dashSize;
            self.ctx.setLineDash([dashSize]);
            self.graphics.stroke(self.colors.roadMarking); 
        }
        self.ctx.restore();
    };

    Visualizer.prototype.drawCar = function(car) {
        var angle = car.lane.getOrientation();
        var width = this.gridStep / 4, length = this.gridStep / 2;
        var center = car.getCenter();
        var boundRect = (new Rect(0, 0, length, width))
            .setCenter(new Point(0, 0)).setRight(-1);

        this.ctx.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(angle);
        var h = car.color;
        var s = 100;
        var l = 90 - 40 * car.speed / 0.8;
        var style = "hsl(" + h + ", " + s + "%, " + l + "%)";
        this.graphics.fillRect(boundRect, style);
        this.ctx.restore();
    };

    Visualizer.prototype.drawGrid = function() {
        this.ctx.fillStyle = this.colors.grid;
        for (var i = 0; i <= this.width; i += this.gridStep) {
            for (var j = 0; j <= this.height; j += this.gridStep) {
                this.graphics.fillRect(new Rect(i - 1, j - 1, 2, 2), this.colors.grid);
            }
        }
    };

    Visualizer.prototype.getClosestGridPoint = function(point) {
        var result = new Point(
            Math.floor(point.x / this.gridStep) * this.gridStep,
            Math.floor(point.y / this.gridStep) * this.gridStep
        );
        return result;
    };

    Visualizer.prototype.drawHighlightedCell = function() {
        if (this.mousePos) {
            this.ctx.fillStyle = this.colors.hoveredGrid;
            var topLeftCorner = this.getClosestGridPoint(this.mousePos);
            this.ctx.fillRect(topLeftCorner.x, topLeftCorner.y, this.gridStep, this.gridStep);
        }
    };

    Visualizer.prototype.getBoundGridRect = function(point1, point2) {
        var gridPoint1 = this.getClosestGridPoint(point1),
            gridPoint2 = this.getClosestGridPoint(point2);
        var x1 = gridPoint1.x, y1 = gridPoint1.y,
            x2 = gridPoint2.x, y2 = gridPoint2.y;
        if (x1 > x2) {
            x1 = x2 + (x2 = x1, 0);
        }
        if (y1 > y2) {
            y1 = y2 + (y2 = y1, 0);
        }
        x2 += this.gridStep;
        y2 += this.gridStep;
        return new Rect(x1, y1, x2 - x1, y2 - y1);
    };

    Visualizer.prototype.getHoveredIntersection = function(point) {
        var intersections = this.world.intersections.all();
        for (var key in intersections) {
            if (intersections.hasOwnProperty(key)) {
                var intersection = intersections[key];
                if (intersection.rect.containsPoint(point)) {
                    return intersection;
                }
            }
        }
    };

    Visualizer.prototype.draw = function() {
        var self = this;
        this.graphics.clear(this.colors.background);
        this.drawGrid();
        this.drawHighlightedCell();
        this.world.roads.each(function(index, road) {
            self.drawRoad(road, 0.9);
        });
        this.world.intersections.each(function(index, intersection) {
            self.drawIntersection(intersection, 0.9);
        });
        this.world.cars.each(function(index, car) {
            self.drawCar(car);
        });
        if (self.tempRoad) {
            self.drawRoad(self.tempRoad, 0.4);
        }
        if (self.tempIntersection) {
            self.drawIntersection(self.tempIntersection, 0.4);
        }
    };

    return Visualizer;
});
