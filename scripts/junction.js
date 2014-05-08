define([], function() {
    function Junction(point) {
        this.id = window.__next_id++;
        this.x = point.x;
        this.y = point.y;
        this.roads = [];
    };

    return Junction;
});
