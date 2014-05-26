define([], function() {
    function Car(lane, position) {
        this.id = window.__next_id++;
        this.lane = lane;
        this.position = position;
        this.speed = (4 + Math.random()) / 5; // 0.8 - 1.0
    }

    Car.prototype.getCenter = function() {
        var line = this.lane.getMiddleline();
        var source = line.source, target = line.target;
        var offset = target.subtract(source);
        return source.add(offset.mult(this.position));
    };

    return Car;
});
