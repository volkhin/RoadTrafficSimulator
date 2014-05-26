define([], function() {
    function Car(lane, position) {
        this.id = window.__next_id++;
        this.speed = 0;
        this.maxSpeed = (4 + Math.random()) / 5; // 0.8 - 1.0
        this.acceleration = 0.02;
        this.moveToLane(lane, position);
    }

    Car.prototype.getCenter = function() {
        var line = this.lane.getMiddleline();
        var source = line.source, target = line.target;
        var offset = target.subtract(source);
        return source.add(offset.mult(this.position));
    };

    Car.prototype.moveToLane = function(lane, position) {
        this.position = position || 0;
        if (this.lane) {
            this.lane.removeCar(this);
        }
        lane.addCar(this);
        this.lane = lane;
    };

    Car.prototype.getNextCar = function() {
        return this.lane.getNextCar(this);
    };

    Car.prototype.getDistanceToNextCar = function() {
        var nextCar = this.getNextCar();
        if (!nextCar) {
            return Infinity;
        }
        var roadLength = this.lane.road.length;
        return (nextCar.position - this.position) * roadLength;
    };

    return Car;
});
