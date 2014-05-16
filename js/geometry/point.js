define([], function()  {
    function Point(arg0, arg1) {
        if (arguments.length === 1 && arg0 instanceof Point) {
            this.x = arg0.x;
            this.y = arg0.y;
        } else if (arguments.length === 2) {
            this.x = arg0;
            this.y = arg1;
        } else {
            throw Error("Invalid parammeters passed to Point constructor");
        }
    }

    return Point;
});
