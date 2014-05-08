define([], function() {
    function Car(road, position) {
        this.id = window.__next_id++;
        this.road = road;
        this.position = position;
        this.speed = (4 + Math.random()) / 5; // 0.8 - 1.0
    };

    Car.prototype.getRoad = function() {
        return app.world.getRoad(this.road);
    };

    return Car;
});
