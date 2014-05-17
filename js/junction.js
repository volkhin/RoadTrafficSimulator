define(["jquery", "underscore"], function($, _) {
    function Junction(rect) {
        this.id = window.__next_id++;
        this.rect = rect;
        this.roads = [];
        this.state = this.STATE.RED;
        this.flipInterval = _.random(10, 50);
    }

    Junction.prototype.STATE = {
        RED: 0,
        GREEN: 1,
    };

    Junction.prototype.getRoads = function() {
        return this.roads;
    };

    Junction.prototype.flip = function() {
        this.state = !this.state;
    };

    Junction.prototype.onTick = function(ticks) {
        if (ticks % this.flipInterval === 0) {
            this.flip();
        }
    };

    Junction.prototype.update = function() {
        $.each(this.roads, function(index, road) {
            road.update();
        });
    };

    return Junction;
});
