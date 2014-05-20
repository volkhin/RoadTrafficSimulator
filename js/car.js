define([], function() {
    function Car(road, position) {
        this.id = window.__next_id++;
        this._road = road;
        this.position = position;
        this.speed = (4 + Math.random()) / 5; // 0.8 - 1.0
    }

    Object.defineProperty(Car.prototype, "road", {
        get: function() {
            return app.world.getRoad(this._road);
        },
        set: function(road) {
            this._road = road;
        },
    });

    return Car;
});
