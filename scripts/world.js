define(["underscore", "car", "utils"], function(_, Car, utils) {
    function World(o) {
        this.set(o);
    };

    World.prototype.set = function(o) {
        (o !== undefined) || (o = {});
        this.roads = o.roads || {};
        this.cars = o.cars || {};
        this.junctions = o.junctions || {};
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
        }
        var road = _.sample(this.roads);
        this.addCar(new Car(road.id, 0)); // FIXME
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
        $.each(this.cars, function(index, car) {
            car.position += 0.01 * car.direction;
            var junction = null;
            var road = self.getRoad(car.road);
            if (car.position >= 1) {
                junction = self.getJunction(road.target);
            } else if (car.position <= 0) {
                junction = self.getJunction(road.source);
            }
            if (junction != null) {
                var possibleRoads = junction.roads.filter(function(x) { return x !== road.id; });
                if (possibleRoads.length == 0) {
                    // TODO: we can just remove a car out of the map
                    possibleRoads = junction.roads;
                }
                var nextRoadId = _.sample(possibleRoads);
                var nextRoad = self.getRoad(nextRoadId);
                car.road = nextRoadId;
                if (nextRoad.source === junction.id) {
                    car.position = 0;
                    car.direction = 1;
                } else if (nextRoad.target === junction.id) {
                    car.position = 1;
                    car.direction = -1;
                } else {
                    console.log(nextRoad);
                    console.log(junction);
                    console.log("Error!");
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

    return World;
});
