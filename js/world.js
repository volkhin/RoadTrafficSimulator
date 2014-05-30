define(function(require) {
    "use strict";

    var $ = require("jquery"),
        _ = require("underscore"),
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
            var self = this;
            $.each(data.intersections, function(index, intersection) {
                intersection = Intersection.copy(intersection);
                self.addIntersection(intersection);
            });
            $.each(data.roads, function(index, road) {
                road = Road.copy(road);
                self.addRoad(road);
            });
            for (var i = 0; i < data.__numOfCars; i++) {
                this.addRandomCar();
            }
        }
    };

    World.prototype.clear = function() {
        this.set({});
    };

    World.prototype.onTick = function() {
        var self = this;
        this.ticks++;
        this.intersections.each(function(index, intersection) {
            intersection.onTick(self.ticks);
        });
        this.cars.each(function(index, car) {
            var lane = car.lane;
            var road = lane.road;
            if (car.getDistanceToNextCar() > 15 && car.relativePosition < 1) { // FIXME
                car.speed += car.acceleration;
                if (car.speed > car.maxSpeed) {
                    car.speed = car.maxSpeed;
                }
                car.absolutePosition += car.speed;
            } else {
                car.speed = 0;
            }
            var intersection = null, previousIntersection = null;
            if (car.relativePosition >= 1) {
                previousIntersection = lane.sourceIntersection;
                intersection = lane.targetIntersection;
                car.relativePosition = 1;
            }
            if (intersection !== null) {
                if (intersection.state[road.targetSideId]) {
                    var possibleRoads = intersection.roads.filter(function(x) {
                        return x.target !== previousIntersection &&
                            x.source !== previousIntersection;
                    });
                    if (possibleRoads.length === 0) {
                        car.moveToLane(null);
                        self.cars.pop(car.id);
                    } else {
                        var nextRoad = _.sample(possibleRoads);
                        if (intersection === nextRoad.source) {
                            car.moveToLane(nextRoad.lanes[0]);
                        } else {
                            car.moveToLane(nextRoad.lanes[nextRoad.lanesNumber - 1]);
                        }
                    }
                } else {
                    car.speed = 0;
                    // car.speed -= car.acceleration;
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

    World.prototype.removeAllCars = function() {
        this.cars.each(function(index, car) {
            car.moveToLane(null);
        });
        this.cars.clear();
    };

    return World;
});
