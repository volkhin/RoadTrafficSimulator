define(["geometry/point"], function(Point) {
    function Rect(arg0, arg1, arg2, arg3) {
        if (arguments.length === 4) {
            this.position = new Point(arg0, arg1);
            this.width = arg2;
            this.height = arg3;
        } else {
            throw new Error("Invalid parammeters passed to Rect constructor");
        }
    }

    Rect.prototype.setPosition = function() {
        var position = Object.create(Point.prototype);
        Point.apply(position, arguments);
        this.position = position;
    };

    Rect.prototype.getPosition = function() {
        return this.position;
    };

    Rect.prototype.setX = function(x) {
        this.position.x = x;
    };

    Rect.prototype.getX = function(x) {
        return this.position.x;
    };

    Rect.prototype.setY = function(y) {
        this.position.y = y;
    };

    Rect.prototype.getY = function(y) {
        return this.position.y;
    };

    Rect.prototype.setWidth = function(width) {
        this.width = width;
    };

    Rect.prototype.getWidth = function(width) {
        return this.width;
    };

    Rect.prototype.setHeight = function(height) {
        this.height = height;
    };

    Rect.prototype.getHeight = function(height) {
        return this.height;
    };

    return Rect;
});
