define(["underscore", "car", "junction", "road", "utils"], function(_, Car, Junction, Road, utils) {
    function World(o) {
        this.set(o);
    };

   World.prototype.set = function(o) {
        (o !== undefined) || (o = {});
        this.roads = o.roads || {};
        this.cars = o.cars || {};
        this.junctions = o.junctions || {};
        this.ticks = o.ticks || 0;
        window.__next_id = o.__next_id || 1;
    };

    World.prototype.save = function() {
        this.__next_id = window.__next_id;
        utils.createCookie("world", JSON.stringify(this));
    };

    World.prototype.load = function() {
        var data = utils.readCookie("world");
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
        }
    };

    World.prototype.clear = function() {
        this.set({});
    };

    World.prototype.getNearestJunction = function(point, maxDistance) {
        maxDistance = maxDistance || Infinity;
        if (!this.junctions)
            return null;
        var junction = _.min(this.junctions, function(junction) {
            return utils.getDistance(point, junction);
        });
        return utils.getDistance(point, junction) < maxDistance ? junction : null;
    };


    World.prototype.onTick = function() {
        var self = this;
        this.ticks++;
        $.map(this.junctions, function(junction) {
            junction.onTick(self.ticks);
        });
        $.each(this.cars, function(index, car) {
            var road = car.getRoad();
            car.position += 2 * car.direction / road.getLength();
            var junction = null;
            if (car.position >= 1) {
                junction = road.getTarget();
            } else if (car.position <= 0) {
                junction = road.getSource();
            }
            if (junction != null) {
                var possibleRoads = junction.getRoads().filter(function(x) {
                    return x.id !== road.id;
                });
                if (possibleRoads.length == 0) {
                    // TODO: we can just remove a car out of the map
                    possibleRoads = junction.getRoads();
                }
                var nextRoad = _.sample(possibleRoads);
                car.road = nextRoad.id;
                if (nextRoad.source === junction.id) {
                    car.position = 0;
                    car.direction = 1;
                } else if (nextRoad.target === junction.id) {
                    car.position = 1;
                    car.direction = -1;
                } else {
                    console.error("Error!");
                }
            }
        });
    };


    World.prototype.addRoad = function(road) {
        this.roads[road.id] = road;
        this.junctions[road.source].roads.push(road.id);
        this.junctions[road.target].roads.push(road.id);
    };

    World.prototype.getRoad = function(id) {
        return this.roads[id];
    }

    World.prototype.addCar = function(car) {
        this.cars[car.id] = car;
    };

    World.prototype.getCar = function(id) {
        return this.cars[id];
    }

    World.prototype.addJunction = function(junction) {
        this.junctions[junction.id] = junction;
    };

    World.prototype.getJunction = function(id) {
        return this.junctions[id];
    }


    World.prototype.addRandomCar = function() {
        var road = _.sample(this.roads);
        this.addCar(new Car(road.id, Math.random()));
    }

    World.prototype.removeAllCars = function() {
        this.cars = {};
    }

    return World;
});
