(function() {
  'use strict';
  define(function(require) {
    var $, Car, Intersection, Pool, Road, World, _;
    $ = require('jquery');
    _ = require('underscore');
    Car = require('model/car');
    Intersection = require('model/intersection');
    Road = require('model/road');
    Pool = require('model/pool');
    return World = (function() {
      function World() {
        this.set({});
      }

      World.property('instantSpeed', {
        get: function() {
          var speeds;
          speeds = _.map(this.cars.all(), function(car) {
            return car.speed;
          });
          if (speeds.length === 0) {
            return 0;
          }
          return (_.reduce(speeds, function(a, b) {
            return a + b;
          })) / speeds.length;
        }
      });

      World.prototype.set = function(obj) {
        if (obj == null) {
          obj = {};
        }
        this.intersections = new Pool(Intersection, obj.intersections);
        this.roads = new Pool(Road, obj.roads);
        this.cars = new Pool(Car, obj.cars);
        this.carsNumber = 0;
        return window.__nextId = obj.__nextId || 1;
      };

      World.prototype.save = function() {
        var data;
        data = $.extend({}, this);
        data.nextId = window.__nextId;
        delete data.cars;
        return localStorage.world = JSON.stringify(data);
      };

      World.prototype.load = function() {
        var data, id, intersection, road, _ref, _ref1, _results;
        data = localStorage.world;
        data = data && JSON.parse(data);
        if (data == null) {
          return;
        }
        this.clear();
        window.__nextId = data.nextId || 1;
        this.carsNumber = data.carsNumber || 0;
        _ref = data.intersections;
        for (id in _ref) {
          intersection = _ref[id];
          this.addIntersection(Intersection.copy(intersection));
        }
        _ref1 = data.roads;
        _results = [];
        for (id in _ref1) {
          road = _ref1[id];
          road = Road.copy(road);
          road.source = this.getIntersection(road.source);
          road.target = this.getIntersection(road.target);
          _results.push(this.addRoad(road));
        }
        return _results;
      };

      World.prototype.clear = function() {
        return this.set({});
      };

      World.prototype.onTick = function(delta) {
        var car, id, intersection, _ref, _ref1, _results;
        if (delta > 1) {
          throw Error('delta > 1');
        }
        this.refreshCars();
        _ref = this.intersections.all();
        for (id in _ref) {
          intersection = _ref[id];
          intersection.controlSignals.onTick(delta);
        }
        _ref1 = this.cars.all();
        _results = [];
        for (id in _ref1) {
          car = _ref1[id];
          car.move(delta);
          if (!car.alive) {
            _results.push(this.removeCar(car));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      World.prototype.refreshCars = function() {
        var _results;
        if (this.roads.length === 0) {
          this.carsNumber = 0;
        }
        while (this.cars.length < this.carsNumber) {
          this.addRandomCar();
        }
        _results = [];
        while (this.cars.length > this.carsNumber) {
          _results.push(this.removeRandomCar());
        }
        return _results;
      };

      World.prototype.addRoad = function(road) {
        this.roads.put(road);
        road.source.roads.push(road);
        road.target.inRoads.push(road);
        return road.update();
      };

      World.prototype.getRoad = function(id) {
        return this.roads.get(id);
      };

      World.prototype.addCar = function(car) {
        return this.cars.put(car);
      };

      World.prototype.getCar = function(id) {
        return this.cars.get(id);
      };

      World.prototype.removeCar = function(car) {
        return this.cars.pop(car);
      };

      World.prototype.addIntersection = function(intersection) {
        return this.intersections.put(intersection);
      };

      World.prototype.getIntersection = function(id) {
        return this.intersections.get(id);
      };

      World.prototype.addRandomCar = function() {
        var lane, road;
        road = _.sample(this.roads.all());
        if (road != null) {
          lane = _.sample(road.lanes);
          if (lane != null) {
            return this.addCar(new Car(lane));
          }
        }
      };

      World.prototype.removeRandomCar = function() {
        var car;
        car = _.sample(this.cars.all());
        if (car != null) {
          return this.removeCar(car);
        }
      };

      return World;

    })();
  });

}).call(this);
