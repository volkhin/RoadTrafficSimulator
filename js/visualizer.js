define(["jquery", "road", "junction", "geometry/rect", "geometry/point", "geometry/Segment", "utils"],
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
        this.gridStep = 20;
        this.mousePos = null;
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

    Visualizer.prototype.getPoint = function(e) {
        return new Point(
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
        );
    };

    Visualizer.prototype.drawJunction = function(junction, alpha, forcedColor) {
        var color = this.colors.junction;
        if (forcedColor) {
            color = forcedColor;
        } else if (junction.color) {
            color = junction.color;
        // } else if (junction.state == Junction.prototype.STATE.RED) {
            // color = this.colors.redLight;
        // } else if (junction.state == Junction.prototype.STATE.GREEN) {
            // color = this.colors.greenLight;
        }
        var rect = junction.rect;
        var center = rect.getCenter();
        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.roadMarking;
        this.ctx.moveTo(center.x - this.gridStep / 3, center.y);
        this.ctx.lineTo(center.x + this.gridStep / 3, center.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.roadMarking;
        this.ctx.moveTo(center.x, center.y - this.gridStep / 3);
        this.ctx.lineTo(center.x, center.y + this.gridStep / 3);
        this.ctx.stroke();

        this.ctx.restore();
    };

    Visualizer.prototype.drawRoad = function(road, alpha) {
        var sourceJunction = road.getSource(), targetJunction = road.getTarget();
        if (sourceJunction && targetJunction) {
            var source = sourceJunction.rect.getCenter(),
                target = targetJunction.rect.getCenter();

            var s1 = sourceJunction.rect.getSector(targetJunction.rect.getCenter()),
                s2 = targetJunction.rect.getSector(sourceJunction.rect.getCenter());

            var self = this;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;

            // draw the road
            this.ctx.fillStyle = this.colors.road;
            this.ctx.beginPath();
            this.ctx.moveTo(s1.source.x, s1.source.y);
            this.ctx.lineTo(s1.target.x, s1.target.y);
            this.ctx.lineTo(s2.source.x, s2.source.y);
            this.ctx.lineTo(s2.target.x, s2.target.y);
            this.ctx.closePath();
            this.ctx.fill();

            // draw lanes
            this.ctx.fillStyle = this.colors.roadMarking;
            for (var i = 0; i < road.lanes.length - 1; i++) {
                var lane = road.lanes[i];
                self.ctx.beginPath();
                self.ctx.strokeStyle = self.colors.roadMarking;
                // FIXME: better way to find lane splits
                var line = new Segment(
                    lane.sourceSegment.target,
                    lane.targetSegment.source
                );
                line = line.subsegment(0.02, 0.98);
                self.ctx.moveTo(line.source.x, line.source.y);
                self.ctx.lineTo(line.target.x, line.target.y);
                self.ctx.stroke(); 
            }

            this.ctx.restore();
        }
    };

    Visualizer.prototype.getCarPositionOnRoad = function(roadId, position) {
        var road = this.world.getRoad(roadId);
        var line = road.lanes[0].getMiddleline();
        // var source = road.getSource().rect.getCenter(), target = road.getTarget().rect.getCenter();
        var source = line.source, target = line.target;
        var offset = target.subtract(source);
        return source.add(offset.mult(position));
    };

    Visualizer.prototype.drawCar = function(car) {
        var point = this.getCarPositionOnRoad(car.road, car.position);
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.car;
        this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
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
