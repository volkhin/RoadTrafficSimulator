define(["jquery", "underscore", "rect"], function($, _, Rect) {
    function Junction(arg0) {
        this.id = window.__next_id++;
        this.rect = arg0;
        this.roads = [];
        this.state = this.STATE.RED;
        this.flipInterval = _.random(10, 50);
    }

    Junction.prototype.clone = function(junction) {
        junction.rect = Rect.prototype.clone(junction.rect);
        junction.roads = []; // FIXME: copy roads
        var result = new Junction(junction.rect);
        $.extend(this, junction);
        return result;
    };

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
