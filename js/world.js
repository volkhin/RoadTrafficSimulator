define(["underscore", "car", "junction", "road", "pool", "point", "rect"],
        function(_, Car, Junction, Road, Pool, Point, Rect) {
    function World(o) {
        this.set(o);
    }

   World.prototype.set = function(o) {
        if (o === undefined) {
            o = {};
        }
        this.junctions = new Pool(Junction, o.junctions);
        this.roads = new Pool(Road, o.roads);
        this.cars = new Pool(Car, o.cars);
        this.ticks = o.ticks || 0;
        window.__next_id = o.__next_id || 1;
    };

    World.prototype.save = function() {
        var data = {
            junctions: this.junctions,
            roads: this.roads,
            __next_id: __next_id,
        };
        localStorage.world = JSON.stringify(data);
    };

    World.prototype.load = function() {
        var data = localStorage.world;
        data = data && JSON.parse(data);
        // this.set(data);
        this.clear();
        window.__next_id = data.__next_id || 1;
        var self = this;
        $.each(data.junctions, function(index, junction) {
            junction = Junction.clone(junction);
            self.addJunction(junction);
        });
        $.each(data.roads, function(index, road) {
            road = Road.clone(road);
            self.addRoad(road);
        });
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
            var lane = car.lane;
            var road = lane.road;
            car.position += 0.01;//2 * car.speed / road.length;
            var junction = null, previousJunction = null;
            if (car.position >= 1) {
                previousJunction = lane.sourceJunction;
                junction = lane.targetJunction;
                car.position = 1;
            }
            if (junction !== null) {
                if (junction.state) {
                    var possibleRoads = junction.roads.filter(function(x) {
                        return x.target !== previousJunction && x.source !== previousJunction;
                    });
                    if (possibleRoads.length === 0) {
                        // TODO: we can just remove a car out of the map
                        possibleRoads = junction.roads;
                    }
                    var nextRoad = _.sample(possibleRoads);
                    if (junction === nextRoad.source) {
                        car.lane = nextRoad.lanes[0]; // FIXME: better choice
                    } else {
                        car.lane = nextRoad.lanes[nextRoad.lanesNumber - 1];
                    }
                    car.position = 0;
                }
            }
        });
    };


    World.prototype.addRoad = function(road) {
        this.roads.put(road);
        road.source.roads.push(road);
        road.target.roads.push(road);
        road.update();
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
        if (road) {
            var lane = road.lanes[0];
            if (lane) {
                this.addCar(new Car(lane, Math.random()));
            }
        }
    };

    World.prototype.removeAllCars = function() {
        this.cars.clear();
    };

    return World;
});
