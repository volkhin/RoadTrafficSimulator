define(["jquery", "underscore", "rect"], function($, _, Rect) {
    function Junction(arg0) {
        this.id = window.__next_id++;
        this.rect = arg0;
        this.roads = [];
        this.state = [
            Junction.STATE.RED,
            Junction.STATE.GREEN,
            Junction.STATE.RED,
            Junction.STATE.GREEN,
        ];
        this.flipInterval = _.random(50, 100);
    }

    Junction.copy = function(junction) {
        junction.rect = Rect.copy(junction.rect);
        var result = Object.create(Junction.prototype);
        return $.extend(result, junction);
    };

    Junction.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        obj.roads = [];
        return obj;
    };

    Junction.STATE = {
        RED: 0,
        GREEN: 1,
    };

    Junction.prototype.flip = function() {
        for (var i = 0; i < this.state.length; i++) {
            this.state[i] = !this.state[i];
        }
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
