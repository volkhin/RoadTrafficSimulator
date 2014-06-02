define(function(require) {
    "use strict";

    var $ = require("jquery");

    function Pool(factory, pool) {
        this.factory = factory;
        this.objects = {};
        pool = pool || {};
        pool.objects = pool.objects || {};
        for (var key in pool.objects) {
            if (pool.objects.hasOwnProperty(key)) {
                this.objects[key] = factory.copy(pool.objects[key]);
            }
        }
    }

    Pool.prototype.toJSON = function() {
        return this.objects;
    };

    Pool.prototype.get = function(id) {
        return this.objects[id];
    };

    Pool.prototype.put = function(obj) {
        if (!obj instanceof Object) {
            throw Error(obj + " is not an object!");
        }
        this.objects[obj.id] = obj;
    };

    Pool.prototype.pop = function(obj) {
        var id = obj.id || obj;
        var result = this.objects[id];
        delete this.objects[id];
        return result;
    };

    Pool.prototype.all = function() {
        return this.objects;
    };

    Pool.prototype.each = function(callback) {
        $.each(this.all(), callback);
    };

    Pool.prototype.clear = function() {
        this.objects = {};
    };

    Object.defineProperty(Pool.prototype, "length", {
        get: function() {
            return Object.keys(this.objects).length;
        },
    });

    return Pool;
});
