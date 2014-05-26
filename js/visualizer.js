define(["jquery", "road", "junction", "rect", "point", "segment", "utils"],
        function($, Road, Junction, Rect, Point, Segment, utils) {
    function Visualizer(world) {
        this.world = world;
        this.canvas = $("#canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.mouseDownPos = null;
        this.tempRoad = null;
        this.tempJunction = null;
        this.dragJunction = null;
        this.mousePos = null;

        // settings
        this.gridStep = 20;
        this.colors = {
            background: "#fff",
            redLight: "#f1433f",
            greenLight: "#a9cf54",
            junction: "#666",
            road: "#666",
            roadMarking: "#eee",
            car: "#333",
            hoveredJunction: "#3d4c53",
            tempRoad: "#aaa",
            grid: "#70b7ba",
            hoveredGrid: "#f4e8e1",
        };
        var self = this;

        $(this.canvas).mousedown(function(e) {
            var point = self.getPoint(e);
            self.mouseDownPos = point;
            var hoveredJunction = self.getHoveredJunction(point);
            if (e.shiftKey) {
                var rect = self.getBoundGridRect(self.mouseDownPos, self.mousePos);
                self.tempJunction = new Junction(rect);
            } else if (e.altKey) {
                self.dragJunction = hoveredJunction;
            } else if (hoveredJunction) {
                self.tempRoad = new Road(hoveredJunction, null);
            }
        });

        $(this.canvas).mouseup(function(e) {
            var point = self.getPoint(e);
            if (self.tempRoad) {
                var hoveredJunction = self.getHoveredJunction(point);
                if (hoveredJunction && self.tempRoad.source.id !== hoveredJunction.id) {
                    var road1 = new Road(self.tempRoad.source, hoveredJunction);
                    self.world.addRoad(road1);
                    // var road2 = new Road(hoveredJunction, self.tempRoad.source);
                    // self.world.addRoad(road2);
                }
                self.tempRoad = null;
            }
            if (self.tempJunction) {
                self.world.addJunction(self.tempJunction);
                self.tempJunction = null;
            }
            self.mouseDownPos = null;
            self.dragJunction = null;
        });

        $(this.canvas).mousemove(function(e) {
            var point = self.getPoint(e);
            var hoveredJunction = self.getHoveredJunction(point);
            self.mousePos = point;
            self.world.junctions.each(function(index, junction) { junction.color = null; });
            if (hoveredJunction) {
                hoveredJunction.color = self.colors.hoveredJunction;
            }
            if (self.tempRoad) {
                self.tempRoad.target = hoveredJunction;
            }
            if (self.dragJunction) {
                var gridPoint = self.getClosestGridPoint(point);
                self.dragJunction.rect.setLeft(gridPoint.x);
                self.dragJunction.rect.setTop(gridPoint.y);
                self.dragJunction.update(); // FIXME: should be done automatically
            }
            if (self.tempJunction) {
                self.tempJunction.rect = self.getBoundGridRect(self.mouseDownPos, self.mousePos);
            }
        });

        this.canvas.addEventListener("mouseout", function(e) {
            self.mouseDownPos = null;
            self.tempRoad = null;
            self.dragJunction = null;
            self.mousePos = null;
            self.tempJunction = null;
        });

    }

    Visualizer.prototype.ctx2coord = function(point) {
        return point;
    };

    Visualizer.prototype.coord2ctx = function(point) {
        return point;
    };

    Visualizer.prototype.getPoint = function(e) {
        var point = new Point(
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
        );
        return point;
    };

    Visualizer.prototype.drawJunction = function(junction, alpha, forcedColor) {
        var color = this.colors.junction;
        if (forcedColor) {
            color = forcedColor;
        } else if (junction.color) {
            color = junction.color;
        }
        var rect = junction.rect;
        var center = rect.getCenter();
        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        // draw intersection
        this.ctx.fillStyle = color;
        this.fillRect(rect);

        this.ctx.restore();
    };

    // drawing helpers
    Visualizer.prototype.moveTo = function(point) {
        this.ctx.moveTo(point.x, point.y);
    };

    Visualizer.prototype.lineTo = function(point) {
        this.ctx.lineTo(point.x, point.y);
    };

    Visualizer.prototype.fillRect = function(rect) {
        this.ctx.fillRect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
    };

    Visualizer.prototype.drawRoad = function(road, alpha) {
        var sourceJunction = road.source, targetJunction = road.target;
        if (sourceJunction && targetJunction) {
            var source = sourceJunction.rect.getCenter(),
                target = targetJunction.rect.getCenter();

            var s1 = sourceJunction.rect.getSector(targetJunction.rect.getCenter()),
                s2 = targetJunction.rect.getSector(sourceJunction.rect.getCenter());

            var self = this;

            // draw the road
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = this.colors.road;
            this.ctx.beginPath();
            this.moveTo(s1.source);
            this.lineTo(s1.target);
            this.lineTo(s2.source);
            this.lineTo(s2.target);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();

            // draw lanes
            self.ctx.save();
            for (var i = 0; i < road.lanes.length; i++) {
                var lane = road.lanes[i];
                var junction = lane.targetJunction;
                var segment = lane.targetSegment.subsegment(0.2, 0.8);
                self.ctx.beginPath();
                self.ctx.strokeStyle = "red";
                self.ctx.lineWidth = 2;
                self.moveTo(segment.source);
                self.lineTo(segment.target);
                self.ctx.stroke();
            }
            self.ctx.restore();

            // draw interlanes
            this.ctx.fillStyle = this.colors.roadMarking;
            self.ctx.save();
            for (var i = 0; i < road.interlanes.length; i++) {
                var line = road.interlanes[i];
                var dashSize = self.gridStep / 2;
                self.ctx.lineDashOffset = 1.5 * dashSize;
                self.ctx.setLineDash([dashSize]);
                self.ctx.strokeStyle = self.colors.roadMarking;
                self.ctx.beginPath();
                self.moveTo(line.source);
                self.lineTo(line.target);
                self.ctx.stroke(); 
            }
            self.ctx.restore();
        }
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
        this.ctx.fillStyle = "hsl(" + h + ", " + s + "%, " + l + "%)";
        // this.ctx.fillStyle = this.colors.car;
        this.fillRect(boundRect);
        this.ctx.restore();
    };

    Visualizer.prototype.drawBackground = function() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    };

    Visualizer.prototype.drawGrid = function() {
        this.ctx.fillStyle = this.colors.grid;
        for (var i = 0; i <= this.width; i += this.gridStep) {
            for (var j = 0; j <= this.height; j += this.gridStep) {
                this.ctx.fillRect(i - 1, j - 1, 2, 2);
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

    Visualizer.prototype.getHoveredJunction = function(point) {
        for (var junction_id in this.world.junctions.all()) {
            var junction = this.world.junctions.get(junction_id);
            if (junction.rect.containsPoint(point))
                return junction;
        }
    };

    Visualizer.prototype.draw = function() {
        var self = this;
        this.drawBackground();
        this.drawGrid();
        this.drawHighlightedCell();
        this.world.roads.each(function(index, road) {
            self.drawRoad(road, 0.9);
        });
        this.world.junctions.each(function(index, junction) {
            self.drawJunction(junction, 0.9);
        });
        this.world.cars.each(function(index, car) {
            self.drawCar(car);
        });
        if (self.tempRoad) {
            self.drawRoad(self.tempRoad, 0.4);
        }
        if (self.tempJunction) {
            self.drawJunction(self.tempJunction, 0.4);
        }
    };

    return Visualizer;
});
