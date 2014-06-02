define(function(require) {
    "use strict";

    var $ = require("jquery"),
        _ = require("underscore"),
        Rect = require("rect");

    function Intersection(arg0) {
        this.id = window.__nextId++;
        this.rect = arg0;
        this.roads = [];
        this.stateNum = 0;
        this.stateNum = 0;
        this.flipInterval = _.random(50, 100);
    }

    Intersection.copy = function(intersection) {
        intersection.rect = Rect.copy(intersection.rect);
        var result = Object.create(Intersection.prototype);
        result = $.extend(result, intersection);
        return result;
    };

    Intersection.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        obj.roads = [];
        delete obj.statesStrings;
        delete obj.states;
        return obj;
    };

    Intersection.prototype.states = [
        ["L", "", "L", ""],
        ["FR", "", "FR", ""],
        ["", "L", "", "L"],
        ["", "FR", "", "FR"],
    ];

    Intersection.STATE = {
        RED: 0,
        GREEN: 1,
    };

    Object.defineProperty(Intersection.prototype, "state", {
        get: function() {
            var stringState = this.states[this.stateNum % this.states.length];
            return $.map(stringState, function(pattern) {
                var state = [0, 0, 0];
                if (pattern.indexOf("L") > -1) {
                    state[0] = 1;
                }
                if (pattern.indexOf("F") > -1) {
                    state[1] = 1;
                }
                if (pattern.indexOf("R") > -1) {
                    state[2] = 1;
                }
                return [state];
            });
        },
    });

    Intersection.prototype.flip = function() {
        this.stateNum++;
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
