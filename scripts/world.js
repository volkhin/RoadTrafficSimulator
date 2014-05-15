define(["underscore", "car", "junction", "road", "pool", "utils"],
        function(_, Car, Junction, Road, Pool, utils) {
    function World(o) {
        this.set(o);
    }

   World.prototype.set = function(o) {
        if (o !== undefined) {
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
