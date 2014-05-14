define(["jquery", "road", "junction", "utils"], function($, Road, Junction, utils) {
    function Visualizer(world) {
        this.THICKNESS = 15;
        this.world = world;
        this.canvas = $("#canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.mouseDownPos = null;
        this.tempLine = null;
        this.tempRect = false;
        this.dragJunction = null;
        this.gridStep = 20;
        this.mousePos = null;
        this.colors = {
            background: "#fdfcfb",
            redLight: "#d03030",
            greenLight: "60a040",
            junction: "#666",
            draggedJunction: "blue",
            road: "#666",
            car: "#333",
            hoveredJunction: "black",
            tempLine: "#aaa",
            grid: "#ddd",
            hoveredGrid: "#f0f0f0",
            unfinishedJunction: "#eee",
        };
        var self = this;

        $(this.canvas).mousedown(function(e) {
            var point = self.getPoint(e);
            self.mouseDownPos = point;
            var hoveredJunction = self.getHoveredJunction(point);
            if (e.shiftKey) {
                self.tempRect = true;
            } else if (e.altKey) {
                self.dragJunction = hoveredJunction;
            } else if (nearestJunction) {
                self.tempLine = utils.line(nearestJunction, point);
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
            if (self.tempRect) {
                var rect = self.getBoundGridRect(self.mouseDownPos, self.mousePos);
                var junction = new Junction(rect);
                self.world.addJunction(junction);
                self.tempRect = false;
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
                self.tempLine.target = point;
            }
            if (self.dragJunction) {
                var gridPoint = self.getClosestGridPoint(point);
                self.dragJunction.rect.left = gridPoint.x;
                self.dragJunction.rect.top = gridPoint.y;
            }
        });

        this.canvas.addEventListener("mouseout", function(e) {
            self.mouseDownPos = null;
            self.tempLine = null;
            self.dragJunction = null;
            self.mousePos = null;
            self.tempRect = false;
        });

    };

    Visualizer.prototype.getPoint = function(e) {
        return {
            x: e.pageX - this.canvas.offsetLeft,
            y: e.pageY - this.canvas.offsetTop,
        };
    };

    Visualizer.prototype.drawJunction = function(junction, color) {
        this.ctx.beginPath();
        if (junction.color) {
            color = junction.color;
        } else if (junction.state == Junction.prototype.STATE.RED) {
            color = this.colors.redLight;
        } else if (junction.state == Junction.prototype.STATE.GREEN) {
            color = this.colors.greenLight;
        }
        this.ctx.fillStyle = color;
        var rect = junction.rect;
        this.ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    };

    Visualizer.prototype.drawLine = function(point1, point2, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        var offset = 0;
        // FIXME: dirty hack, should be replaced with graph-drawing library
        len = utils.getDistance(point1, point2);
        dx = 2 * (point2.x - point1.x) / len;
        dy = 2 * (point2.y - point1.y) / len;
        this.ctx.moveTo(point1.x - dy, point1.y + dx);
        this.ctx.lineTo(point2.x - dy, point2.y + dx);
        this.ctx.stroke();
    };

    Visualizer.prototype.getCarPositionOnRoad = function(roadId, position) {
        var road = this.world.getRoad(roadId);
        var source = road.getSource(), target = road.getTarget();
        var dx = target.x - source.x,
            dy = target.y - source.y;
        len = utils.getDistance(source, target);
        off_x = 2 * (target.x - source.x) / len;
        off_y = 2 * (target.y - source.y) / len;
        off_x = off_y = 0;
        return {
            x: source.x + position * dx + off_y,
            y: source.y + position * dy + off_x,
        };
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
        return {left: x1, top: y1, width: x2 - x1, height: y2 - y1};
    };

    Visualizer.prototype.drawTempJunction = function() {
        var rect = this.getBoundGridRect(this.mouseDownPos, this.mousePos);
        this.ctx.fillStyle = this.colors.unfinishedJunction;
        this.ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    };

    Visualizer.prototype.getHoveredJunction = function(point) {
        for (var junction_id in this.world.junctions.all()) {
            var junction = this.world.junctions.get(junction_id);
            var rect = junction.rect;
            if (rect.left <= point.x && point.x < rect.left + rect.width &&
                    rect.top <= point.y && point.y < rect.top + rect.height) {
                return junction;
            }
        }
    };

    Visualizer.prototype.draw = function() {
        var self = this;
        this.drawBackground();
        this.drawGrid();
        this.drawHighlightedCell();
        this.world.roads.each(function(index, road) {
            var source = road.getSource(), target = road.getTarget();
            self.drawLine(source, target, self.colors.road);
        });
        this.world.junctions.each(function(index, junction) {
            self.drawJunction(junction, self.colors.junction);
        });
        this.world.cars.each(function(index, car) {
            self.drawCar(car);
        });
        if (self.tempLine) {
            self.drawLine(self.tempLine.source, self.tempLine.target, self.colors.tempLine);
        }
        if (self.tempRect) {
            self.drawTempJunction();
        }
    };

    return Visualizer;
});
