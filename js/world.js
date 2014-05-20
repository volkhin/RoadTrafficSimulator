define(["underscore", "car", "junction", "road", "pool", "point", "rect", "serializer"],
        function(_, Car, Junction, Road, Pool, Point, Rect, serializer) {
    function World(o) {
        this.set(o);
    }

   World.prototype.set = function(o) {
        if (o === undefined) {
            o = {};
        }
        this.roads = new Pool(Road, o.roads);
        this.cars = new Pool(Car, o.cars);
        this.junctions = new Pool(Junction, o.junctions);
        this.ticks = o.ticks || 0;
        window.__next_id = o.__next_id || 1;
    };

    World.prototype.save = function() {
        var data = {
            junctions: this.junctions,
            roads: [],
            __next_id: __next_id,
        };
        serializer.save("world", data);
    };

    World.prototype.load = function() {
        var data = serializer.load("world", this);
        this.set(data);
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
            var road = car.road;
            car.position += 0.01;//2 * car.speed / road.length;
            var junction = null;
            if (car.position >= 1) {
                junction = road.target;
                car.position = 1;
            }
            if (junction !== null) {
                if (junction.state) {
                    var possibleRoads = junction.roads.filter(function(x) {
                        return x.target !== road.source;
                    });
                    if (possibleRoads.length === 0) {
                        // TODO: we can just remove a car out of the map
                        possibleRoads = junction.roads;
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
            this.addCar(new Car(road.id, Math.random()));
        }
    };

    World.prototype.removeAllCars = function() {
        this.cars = {};
    };

    return World;
});
