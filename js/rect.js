define(["point", "segment"], function(Point, Segment) {
    function Rect(arg0, arg1, arg2, arg3) {
        if (arguments.length === 4) {
            this.position = new Point(arg0, arg1);
            this.width = arg2;
            this.height = arg3;
        } else {
            throw new Error("Invalid parammeters passed to Rect constructor");
        }
    }

    Rect.clone = function(rect) {
        return new Rect(rect.position.x, rect.position.y, rect.width, rect.height);
    };

    Rect.prototype.setPosition = function() {
        var position = Object.create(Point.prototype);
        Point.apply(position, arguments);
        this.position = position;
        return this;
    };

    Rect.prototype.getPosition = function() {
        return this.position;
    };

    Rect.prototype.setLeft = function(x) {
        this.position.x = x;
        return this;
    };

    Rect.prototype.getLeft = function() {
        return this.position.x;
    };

    Rect.prototype.getRight = function() {
        return this.getLeft() + this.getWidth();
    };

    Rect.prototype.setTop = function(y) {
        this.position.y = y;
        return this;
    };

    Rect.prototype.getTop = function() {
        return this.position.y;
    };

    Rect.prototype.getBottom = function() {
        return this.getTop() + this.getHeight();
    };

    Rect.prototype.setWidth = function(width) {
        this.width = width;
        return this;
    };

    Rect.prototype.getWidth = function() {
        return this.width;
    };

    Rect.prototype.setHeight = function(height) {
        this.height = height;
        return this;
    };

    Rect.prototype.getHeight = function() {
        return this.height;
    };

    Rect.prototype.setCenter = function(point) {
        this.position.x = point.x - this.width / 2;
        this.position.y = point.y - this.height / 2;
        return this;
    };

    Rect.prototype.getCenter = function() {
        return this.position.add(new Point(this.width / 2, this.height/ 2));
    };

    Rect.prototype.containsPoint = function(point) {
        if (!point instanceof Point) {
            throw Error("Should be a point!");
        }
        return this.getLeft() <= point.x && point.x <= this.getRight() &&
            this.getTop() <= point.y && point.y <= this.getBottom();
    };

    Rect.prototype.getVertices = function() {
        // returns vertices in CW order starting with the top-left
        var x = this.position.x, y = this.position.y;
        return [
            new Point(x, y),
            new Point(x + this.getWidth(), y),
            new Point(x + this.getWidth(), y + this.getHeight()),
            new Point(x, y + this.getHeight()),
        ];
    };

    Rect.prototype.getSide = function(i) {
        // returns sides in CW order starting with the top
        var vertices = this.getVertices();
        return new Segment(vertices[i], vertices[(i + 1) % 4]);
    };

    Rect.prototype.getSectorId = function(point) {
        // returns the closest side to the point
        var center = this.getCenter();
        var offset = point.subtract(center);
        if (offset.y <= 0 && Math.abs(offset.x) <= Math.abs(offset.y))
            return 0;
        if (offset.x >= 0 && Math.abs(offset.x) >= Math.abs(offset.y))
            return 1;
        if (offset.y >= 0 && Math.abs(offset.x) <= Math.abs(offset.y))
            return 2;
        if (offset.x <= 0 && Math.abs(offset.x) >= Math.abs(offset.y))
            return 3;
        throw Error("Algorithm error");
    };

    Rect.prototype.getSector = function(point) {
        return this.getSide(this.getSectorId(point));
    };

    return Rect;
});
