define(["jquery", "underscore", "road", "junction", "utils"], function($, _, Road, Junction, utils) {
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
                    var road = new Road(self.tempLine.source, junction);
                    self.world.addRoad(road);
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
            _.map(self.world.junctions, function(junction) { junction.color = null; });
            if (nearestJunction) {
                nearestJunction.color = "red";
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

    }

    Visualizer.prototype.drawJunction = function(c, color) {
        this.ctx.beginPath();
        this.ctx.fillStyle = c.color || color;
        this.ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    Visualizer.prototype.drawLine = function(point1, point2, color) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(point1.x, point1.y);
        this.ctx.lineTo(point2.x, point2.y);
        this.ctx.stroke();
    }

    Visualizer.prototype.getCarPositionOnRoad = function(roadId, position) {
        var road = this.world.getRoad(roadId);
        var source = this.world.getJunction(road.source),
            target = this.world.getJunction(road.target);
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
        this.ctx.fillStyle = "green";
        this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    Visualizer.prototype.draw = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        var self = this;
        $.each(this.world.roads, function(index, road) {
            var source = self.world.getJunction(road.source),
                target = self.world.getJunction(road.target);
            self.drawLine(source, target, "666");
        });
        $.each(this.world.junctions, function(index, junction) {
            self.drawJunction(junction, "#666");
        });
        $.each(this.world.cars, function(index, car) {
            self.drawCar(car);
        });
        if (self.tempLine) {
            self.drawLine(self.tempLine.source, self.tempLine.target, "#aaa");
        }
    }

    return Visualizer;
});
