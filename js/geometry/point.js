define(function()  {
    "use strict";

    function Point(arg0, arg1) {
        if (arguments.length === 1 && arg0 instanceof Point) {
            this.x = arg0.x;
            this.y = arg0.y;
        } else {
            this.x = arg0 || 0;
            this.y = arg1 || 0;
        }
    }

    Point.prototype.add = function(o) {
        return new Point(this.x + o.x, this.y + o.y);
    };

    Point.prototype.subtract = function(o) {
        return new Point(this.x - o.x, this.y - o.y);
    };

    Point.prototype.mult = function(o) {
        return new Point(this.x * o, this.y * o);
    };

    Point.prototype.divide = function(o) {
        return new Point(this.x / o, this.y / o);
    };

    Point.prototype.normalize = function() {
        var l = this.length;
        return new Point(this.x / l, this.y / l);
    };

    Object.defineProperty(Point.prototype, "length", {
        get: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
    });

    Object.defineProperty(Point.prototype, "direction", {
        get: function() {
            return Math.atan2(this.y, this.x);
        },
    });
    return Point;
});
