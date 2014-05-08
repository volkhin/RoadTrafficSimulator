define([], function() {
    function Car(road, position) {
        this.id = window.__next_id++;
        this.road = road;
        this.position = position;
        this.direction = 1;
    };

    Car.prototype.getRoad = function() {
        return app.world.getRoad(this.road);
    };

    return Car;
});
