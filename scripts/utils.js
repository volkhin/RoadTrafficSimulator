define([], function() {
    utils = {};

    utils.createCookie = function(name, value) {
        document.cookie = name + "=" + value + "; path=/";
    };

    utils.readCookie = function(c_name) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
                }
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    };

    utils.getDistance = function(point1, point2) {
        var dx = point1.x - point2.x,
            dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    utils.line = function(point1, point2) {
        return {source: point1, target: point2};
    };

    return utils
});
