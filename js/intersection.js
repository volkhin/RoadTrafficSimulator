define(["jquery", "underscore", "rect"], function($, _, Rect) {
    function Intersection(arg0) {
        this.id = window.__next_id++;
        this.rect = arg0;
        this.roads = [];
        this.state = [
            Intersection.STATE.RED,
            Intersection.STATE.GREEN,
            Intersection.STATE.RED,
            Intersection.STATE.GREEN,
        ];
        this.flipInterval = _.random(50, 100);
    }

    Intersection.copy = function(intersection) {
        intersection.rect = Rect.copy(intersection.rect);
        var result = Object.create(Intersection.prototype);
        return $.extend(result, intersection);
    };

    Intersection.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        obj.roads = [];
        return obj;
    };

    Intersection.STATE = {
        RED: 0,
        GREEN: 1,
    };

    Intersection.prototype.flip = function() {
        for (var i = 0; i < this.state.length; i++) {
            this.state[i] = !this.state[i];
        }
    };

    Intersection.prototype.onTick = function(ticks) {
        if (ticks % this.flipInterval === 0) {
            this.flip();
        }
    };

    Intersection.prototype.update = function() {
        $.each(this.roads, function(index, road) {
            road.update();
        });
    };

    return Intersection;
});
