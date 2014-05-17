define('utils',[], function() {
    utils = {};

    utils.createCookie = function(name, value) {
        document.cookie = name + "=" + value + "; path=/";
    };

    utils.readCookie = function(c_name) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
                }
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    };

    utils.getDistance = function(point1, point2) {
        var dx = point1.x - point2.x,
            dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    utils.line = function(point1, point2) {
        return {source: point1, target: point2};
    };

    return utils;
});

define('road',["utils"], function(utils) {
    function Road(source, target) {
        this.id = window.__next_id++;
        if (source instanceof Object) {
            this.source = source.id;
        } else {
            this.source = source;
        }
        if (target instanceof Object) {
            this.target = target.id;
        } else {
            this.target = target;
        }
    }

    Road.prototype.getLength = function() {
        return utils.getDistance(this.getSource(), this.getTarget());
    };

    Road.prototype.getSource = function() {
        return app.world.getJunction(this.source);
    };

    Road.prototype.getTarget = function() {
        return app.world.getJunction(this.target);
    };

    return Road;
});

define('junction',["underscore"], function(_) {
    function Junction(rect) {
        this.id = window.__next_id++;
        this.rect = rect;
        this.roads = [];
        this.state = this.STATE.RED;
        this.flipInterval = _.random(10, 50);
    }

    Junction.prototype.STATE = {
        RED: 0,
        GREEN: 1,
    };

    Junction.prototype.getRoads = function() {
        return $.map(this.roads, function(road) {
            return app.world.getRoad(road);
        });
    };

    Junction.prototype.flip = function() {
        this.state = !this.state;
    };

    Junction.prototype.onTick = function(ticks) {
        if (ticks % this.flipInterval === 0) {
            this.flip();
        }
    };

    return Junction;
});

define('geometry/point',[], function()  {
    function Point(arg0, arg1) {
        if (arguments.length === 1 && arg0 instanceof Point) {
            this.x = arg0.x;
            this.y = arg0.y;
        } else if (arguments.length === 2) {
            this.x = arg0;
            this.y = arg1;
        } else {
            throw new Error("Invalid parammeters passed to Point constructor");
        }
    }

    Point.prototype.add = function(o) {
        return new Point(this.x + o.x, this.y + o.y);
    };

    Point.prototype.subtract = function(o) {
        return new Point(this.x - o.x, this.y - o.y);
    };

    Point.prototype.mult = function(o) {
        return new Point(this.x * o, this.y * o);
    };

    Point.prototype.divide = function(o) {
        return new Point(this.x / o, this.y / o);
    };

    return Point;
});

define('geometry/rect',["geometry/point"], function(Point) {
    function Rect(arg0, arg1, arg2, arg3) {
        if (arguments.length === 4) {
            this.position = new Point(arg0, arg1);
            this.width = arg2;
            this.height = arg3;
        } else {
            throw new Error("Invalid parammeters passed to Rect constructor");
        }
    }

    Rect.prototype.setPosition = function() {
        var position = Object.create(Point.prototype);
        Point.apply(position, arguments);
        this.position = position;
    };

    Rect.prototype.getPosition = function() {
        return this.position;
    };

    Rect.prototype.setLeft = function(x) {
        this.position.x = x;
    };

    Rect.prototype.getLeft = function() {
        return this.position.x;
    };

    Rect.prototype.getRight = function() {
        return this.getLeft() + this.getWidth();
    };

    Rect.prototype.setTop = function(y) {
        this.position.y = y;
    };

    Rect.prototype.getTop = function() {
        return this.position.y;
    };

    Rect.prototype.getBottom = function() {
        return this.getTop() + this.getHeight();
    };

    Rect.prototype.setWidth = function(width) {
        this.width = width;
    };

    Rect.prototype.getWidth = function() {
        return this.width;
    };

    Rect.prototype.setHeight = function(height) {
        this.height = height;
    };

    Rect.prototype.getHeight = function() {
        return this.height;
    };

    Rect.prototype.getCenter = function() {
        return this.position.add(new Point(this.width / 2, this.height/ 2));
    };

    return Rect;
});

define('visualizer',["jquery", "road", "junction", "geometry/rect", "utils"],
        function($, Road, Junction, Rect, utils) {
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
                self.tempLine = utils.line(hoveredJunction, point);
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
                self.tempLine.target = point;
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
        return {
            x: e.pageX - this.canvas.offsetLeft,
            y: e.pageY - this.canvas.offsetTop,
        };
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

    Visualizer.prototype.drawLine = function(point1, point2, color) {
        var offset = 0;
        // FIXME: dirty hack, should be replaced with graph-drawing library
        len = utils.getDistance(point1, point2);
        dx = 2 * (point2.x - point1.x) / len;
        dy = 2 * (point2.y - point1.y) / len;
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
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
        return new Rect(x1, y1, x2 - x1, y2 - y1);
    };

    Visualizer.prototype.getHoveredJunction = function(point) {
        for (var junction_id in this.world.junctions.all()) {
            var junction = this.world.junctions.get(junction_id);
            var rect = junction.rect;
            if (rect.getLeft() <= point.x && point.x < rect.getRight() &&
                    rect.getTop() <= point.y && point.y < rect.getBottom()) {
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
            self.drawJunction(junction);
        });
        this.world.cars.each(function(index, car) {
            self.drawCar(car);
        });
        if (self.tempLine) {
            self.drawLine(self.tempLine.source, self.tempLine.target, self.colors.tempLine);
        }
        if (self.tempJunction) {
            self.drawJunction(self.tempJunction, self.colors.unfinishedJunction);
        }
    };

    return Visualizer;
});

define('car',[], function() {
    function Car(road, position) {
        this.id = window.__next_id++;
        this.road = road;
        this.position = position;
        this.speed = (4 + Math.random()) / 5; // 0.8 - 1.0
    }

    Car.prototype.getRoad = function() {
        return app.world.getRoad(this.road);
    };

    return Car;
});

define('pool',["jquery"], function($) {
    function Pool() {
        this.objects = {};
    }

    Pool.prototype.get = function(id) {
        return this.objects[id];
    };

    Pool.prototype.put = function(obj) {
        if (!obj instanceof Object) {
            console.error(obj + " is not an object!");
            return;
        }
        this.objects[obj.id] = obj;
    };

    Pool.prototype.all = function() {
        return this.objects;
    };

    Pool.prototype.each = function(callback) {
        $.each(this.all(), callback);
    };

    return Pool;
});

define('world',["underscore", "car", "junction", "road", "pool", "utils"],
        function(_, Car, Junction, Road, Pool, utils) {
    function World(o) {
        this.set(o);
    }

   World.prototype.set = function(o) {
        if (o === undefined) {
            o = {};
        }
        this.roads = o.roads || new Pool();
        this.cars = o.cars || new Pool();
        this.junctions = o.junctions || new Pool();
        this.ticks = o.ticks || 0;
        window.__next_id = o.__next_id || 1;
    };

    World.prototype.save = function() {
        return; // FIXME
        /* this.__next_id = window.__next_id;
        utils.createCookie("world", JSON.stringify(this)); */
    };

    World.prototype.load = function() {
        return; // FIXME
        /* var data = utils.readCookie("world");
        if (data) {
            this.set(JSON.parse(data));
            $.each(this.junctions, function(index, junction) {
                junction.__proto__ = Junction.prototype;
            });
            $.each(this.roads, function(index, road) {
                road.__proto__ = Road.prototype;
            });
            $.each(this.cars, function(index, car) {
                car.__proto__ = Car.prototype;
            });
        } */
    };

    World.prototype.clear = function() {
        this.set({});
    };

    World.prototype.onTick = function() {
        var self = this;
        this.ticks++;
        this.junctions.each(function(index, junction) {
            junction.onTick(self.ticks);
        });
        this.cars.each(function(index, car) {
            var road = car.getRoad();
            car.position += 2 * car.speed / road.getLength();
            var junction = null;
            if (car.position >= 1) {
                junction = road.getTarget();
                car.position = 1;
            }
            if (junction !== null) {
                if (junction.state) {
                    var possibleRoads = junction.getRoads().filter(function(x) {
                        return x.target !== road.source;
                    });
                    if (possibleRoads.length === 0) {
                        // TODO: we can just remove a car out of the map
                        possibleRoads = junction.getRoads();
                    }
                    var nextRoad = _.sample(possibleRoads);
                    car.road = nextRoad.id;
                    car.position = 0;
                }
            }
        });
    };


    World.prototype.addRoad = function(road) {
        this.roads.put(road);
        this.getJunction(road.source).roads.push(road.id);
    };

    World.prototype.getRoad = function(id) {
        return this.roads.get(id);
    };

    World.prototype.addCar = function(car) {
        this.cars.put(car);
    };

    World.prototype.getCar = function(id) {
        return this.cars.get(id);
    };

    World.prototype.addJunction = function(junction) {
        this.junctions.put(junction);
    };

    World.prototype.getJunction = function(id) {
        return this.junctions.get(id);
    };

    World.prototype.addRandomCar = function() {
        var road = _.sample(this.roads.all());
        this.addCar(new Car(road.id, Math.random()));
    };

    World.prototype.removeAllCars = function() {
        this.cars = {};
    };

    return World;
});

define('app',["jquery", "visualizer", "world"], function($, Visualizer, World) {
    function App() {
        this.FPS = 30;
    }

    App.prototype.init = function() {
        this.world = new World();
        this.world.load();
        this.visualizer = new Visualizer(this.world);
        setInterval(this.visualizer.draw.bind(this.visualizer), 1000 / this.FPS);
        setInterval(this.world.onTick.bind(this.world), 1000 / this.FPS);
    };

    return App;
});

require.config({
    baseUrl: "js",
    paths: {
        "jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
        "underscore": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min",
    },
});

require(["jquery", "app"], function($, App) {
    $(document).ready(function () {
        window.app = new App();
        app.init();
    });
});

define("main", function(){});

