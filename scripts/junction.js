define([], function() {
    function Junction(point) {
        this.id = window.__next_id++;
        this.x = point.x;
        this.y = point.y;
        this.roads = [];
    };

    Junction.prototype.getRoads = function() {
        return $.map(this.roads, function(road) {
            return app.world.getRoad(road);
        });
    };

    return Junction;
});
