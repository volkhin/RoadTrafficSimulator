define(["jquery", "road", "junction", "geometry/rect", "geometry/point", "utils"],
        function($, Road, Junction, Rect, Point, utils) {
    function Visualizer(world) {
        this.world = world;
        this.canvas = $("#canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.mouseDownPos = null;
        this.tempLine = null;
        this.tempJunction = null;
        this.dragJunction = null;
        this.gridStep = 20;
        this.mousePos = null;
        this.colors = {
            background: "#fdfcfb",
            redLight: "#f1433f",
            greenLight: "#a9cf54",
            junction: "#666",
            road: "#666",
            car: "#333",
            hoveredJunction: "#3d4c53",
            tempLine: "#aaa",
            grid: "#70b7ba",
            hoveredGrid: "#f4e8e1",
            unfinishedJunction: "#eee",
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
                self.tempLine = utils.line(hoveredJunction, null);
            }
        });

        $(this.canvas).mouseup(function(e) {
            var point = self.getPoint(e);
            if (self.tempLine) {
                var hoveredJunction = self.getHoveredJunction(point);
                if (hoveredJunction) {
                    var road1 = new Road(self.tempLine.source, hoveredJunction);
                    self.world.addRoad(road1);
                    var road2 = new Road(hoveredJunction, self.tempLine.source);
                    self.world.addRoad(road2);
                }
                self.tempLine = null;
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
            if (self.tempLine) {
                self.tempLine.target = hoveredJunction;
            }
            if (self.dragJunction) {
                var gridPoint = self.getClosestGridPoint(point);
                self.dragJunction.rect.setLeft(gridPoint.x);
                self.dragJunction.rect.setTop(gridPoint.y);
            }
            if (self.tempJunction) {
                self.tempJunction.rect = self.getBoundGridRect(self.mouseDownPos, self.mousePos);
            }
        });

        this.canvas.addEventListener("mouseout", function(e) {
            self.mouseDownPos = null;
            self.tempLine = null;
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

    Visualizer.prototype.drawJunction = function(junction, forcedColor) {
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
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
        var center = rect.getCenter();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.background;
        this.ctx.moveTo(center.x - this.gridStep / 3, center.y);
        this.ctx.lineTo(center.x + this.gridStep / 3, center.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.background;
        this.ctx.moveTo(center.x, center.y - this.gridStep / 3);
        this.ctx.lineTo(center.x, center.y + this.gridStep / 3);
        this.ctx.stroke();
    };

    Visualizer.prototype.drawRoad = function(sourceJunction, targetJunction, color) {
        if (sourceJunction && targetJunction) {
            var source = sourceJunction.rect.getCenter(),
                target = targetJunction.rect.getCenter();
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.moveTo(source.x, source.y);
            this.ctx.lineTo(target.x, target.y);
            this.ctx.stroke();
        }
    };

    Visualizer.prototype.getCarPositionOnRoad = function(roadId, position) {
        var road = this.world.getRoad(roadId);
        var source = road.getSource(), target = road.getTarget();
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
        var result = {
            x: Math.floor(point.x / this.gridStep) * this.gridStep,
            y: Math.floor(point.y / this.gridStep) * this.gridStep,
        };
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
            var source = road.getSource(), target = road.getTarget();
            // self.drawRoad(road);
        });
        this.world.junctions.each(function(index, junction) {
            self.drawJunction(junction);
        });
        this.world.cars.each(function(index, car) {
            self.drawCar(car);
        });
        if (self.tempLine) {
            self.drawRoad(self.tempLine.source, self.tempLine.target, self.colors.tempLine);
        }
        if (self.tempJunction) {
            self.drawJunction(self.tempJunction, self.colors.unfinishedJunction);
        }
    };

    return Visualizer;
});
