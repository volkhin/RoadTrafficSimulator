define(function(require) {
    "use strict";

    var _ = require("underscore"),
        Car = require("car"),
        Intersection = require("intersection"),
        Road = require("road"),
        Pool = require("pool");

    function World(o) {
        this.set(o);
    }

   World.prototype.set = function(o) {
        if (o === undefined) {
            o = {};
        }
        this.intersections= new Pool(Intersection, o.intersections);
        this.roads = new Pool(Road, o.roads);
        this.cars = new Pool(Car, o.cars);
        this.ticks = o.ticks || 0;
        window.__nextId = o.__nextId || 1;
    };

    World.prototype.save = function() {
        var data = {
            intersections: this.intersections,
            roads: this.roads,
            __numOfCars: this.cars.length,
            __nextId: window.__nextId,
        };
        localStorage.world = JSON.stringify(data);
    };

    World.prototype.load = function() {
        var data = localStorage.world;
        data = data && JSON.parse(data);
        if (data) {
            this.clear();
            window.__nextId = data.__nextId || 1;
            _.each(data.intersections, function(intersection) {
                intersection = Intersection.copy(intersection);
                this.addIntersection(intersection);
            }, this);
            _.each(data.roads, function(road) {
                road = Road.copy(road);
                this.addRoad(road);
            }, this);
            for (var i = 0; i < data.__numOfCars; i++) {
                this.addRandomCar();
            }
        }
    };

    World.prototype.clear = function() {
        this.set({});
    };

    World.prototype.onTick = function(delta) {
        if (delta > 1) {
            throw Error("delta can't be more than 1");
        }
        this.ticks++;
        _.each(this.intersections.all(), function(intersection) {
            intersection.onTick(this.ticks);
        }, this);
        _.each(this.cars.all(), function(car) {
            car.move(delta);
            if (!car.alive) {
                this.removeCar(car);
            }
        }, this);
    };

    World.prototype.addRoad = function(road) {
        this.roads.put(road);
        road.source.roads.push(road);
        road.target.inRoads.push(road);
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

    World.prototype.removeCar = function(car) {
        this.cars.pop(car);
    };

    World.prototype.addIntersection = function(intersection) {
        this.intersections.put(intersection);
    };

    World.prototype.getIntersection = function(id) {
        return this.intersections.get(id);
    };

    World.prototype.addRandomCar = function() {
        var road = _.sample(this.roads.all());
        if (road) {
            var lane = _.sample(road.lanes);
            if (lane) {
                this.addCar(new Car(lane));
            }
        }
    };

    World.prototype.removeRandomCar = function() {
        var car = _.sample(this.cars.all());
        this.removeCar(car);
    };

    Object.defineProperty(World.prototype, "carsNumber", {
        get: function() {
            return this.cars.length;
        },
        set: function(number) {
            while (this.carsNumber < number) {
                this.addRandomCar();
            }
            while (this.carsNumber > number) {
                this.removeRandomCar();
            }
        },
    });

    World.prototype.removeAllCars = function() {
        while(this.cars.length) {
            this.removeRandomCar();
        }
    };

    Object.defineProperty(World.prototype, "instantSpeed", {
        get: function() {
            var speeds = _.map(this.cars.all(), function(car) {
                return car.speed;
            });
            if (speeds.length === 0) {
                return 0.0;
            }
            return 1.0 * _.reduce(speeds, function(a, b) { return a + b; }) / speeds.length;
        },
    });

    return World;
});
