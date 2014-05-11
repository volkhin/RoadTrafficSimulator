define(["jquery", "road", "junction", "utils"], function($, Road, Junction, utils) {
    function Visualizer(world) {
        this.THICKNESS = 15;
        this.world = world;
        this.canvas = $("#canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.mouseDown = false;
        this.tempLine = null;
        this.dragJunction = null;
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
        };
        var self = this;

        this.canvas.addEventListener("mousedown", function(e) {
            var nearestJunction = self.world.getNearestJunction(utils.getPoint(e), self.THICKNESS);
            if (e.shiftKey) {
                var junction = new Junction(utils.getPoint(e));
                self.world.addJunction(junction);
            } else if (e.altKey) {
                self.dragJunction = nearestJunction;
            } else {
                if (nearestJunction) {
                    self.mouseDown = true;
                    self.tempLine = utils.line(nearestJunction, utils.getPoint(e));
                }
            }
        });

        this.canvas.addEventListener("mouseup", function(e) {
            self.mouseDown = false;
            if (self.tempLine) {
                var junction = self.world.getNearestJunction(utils.getPoint(e), self.THICKNESS);
                if (junction) {
                    var road1 = new Road(self.tempLine.source, junction);
                    self.world.addRoad(road1);
                    var road2 = new Road(junction, self.tempLine.source);
                    self.world.addRoad(road2);
                }
                self.tempLine = null;
            }
            if (self.dragJunction) {
                self.dragJunction = null;
            }
        });

        this.canvas.addEventListener("mousemove", function(e) {
            var point = utils.getPoint(e);
            var nearestJunction = self.world.getNearestJunction(point, self.THICKNESS);
            $.map(self.world.junctions, function(junction) { junction.color = null; });
            if (nearestJunction) {
                nearestJunction.color = self.colors.hoveredJunction;
            }

            if (self.tempLine) {
                self.tempLine.target = utils.getPoint(e);
            }

            if (self.dragJunction) {
                var point = utils.getPoint(e);
                self.dragJunction.x = point.x;
                self.dragJunction.y =  point.y;
            }
        });

        this.canvas.addEventListener("mouseout", function(e) {
            self.mouseDown = false;
            self.tempLine = null;
            self.dragJunction = null;
        });

    };

    Visualizer.prototype.drawJunction = function(c, color) {
        this.ctx.beginPath();
        if (c.color) {
            color = c.color;
        } else if (c.state == Junction.prototype.STATE.RED) {
            color = this.colors.redLight;
        } else if (c.state == Junction.prototype.STATE.GREEN) {
            color = this.colors.greenLight;
        }
        this.ctx.fillStyle = color;
        this.ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    };

    Visualizer.prototype.drawLine = function(point1, point2, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        var offset = 0;
        // FIXME: dirty hack, should be replaced with graph-drawing library
        if (point1.x < point2.x) {
            offset = 2;
        } else {
            offset = -2;
        }
        this.ctx.moveTo(point1.x + offset, point1.y + offset);
        this.ctx.lineTo(point2.x + offset, point2.y + offset);
        this.ctx.stroke();
    };

    Visualizer.prototype.getCarPositionOnRoad = function(roadId, position) {
        var road = this.world.getRoad(roadId);
        var source = road.getSource(), target = road.getTarget();
        var dx = target.x - source.x,
            dy = target.y - source.y;
        return {
            x: source.x + position * dx,
            y: source.y + position * dy,
        };
    };

    Visualizer.prototype.drawCar = function(car) {
        var point = this.getCarPositionOnRoad(car.road, car.position);
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.car;
        this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    };

    Visualizer.prototype.draw = function() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        var self = this;
        $.each(this.world.roads, function(index, road) {
            var source = road.getSource(), target = road.getTarget();
            self.drawLine(source, target, self.colors.road);
        });
        $.each(this.world.junctions, function(index, junction) {
            self.drawJunction(junction, self.colors.junction);
        });
        $.each(this.world.cars, function(index, car) {
            self.drawCar(car);
        });
        if (self.tempLine) {
            self.drawLine(self.tempLine.source, self.tempLine.target, self.colors.tempLine);
        }
    };

    return Visualizer;
});
