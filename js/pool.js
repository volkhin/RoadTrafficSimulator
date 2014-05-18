define(["jquery"], function($) {
    function Pool(factory, pool) {
        this.factory = factory;
        this.objects = {};
        if (pool && pool.objects) {
            for (var key in pool.objects) {
                this.objects[key] = factory.prototype.clone(pool.objects[key]);
            }
        }
    }

    Pool.prototype.get = function(id) {
        return this.objects[id];
    };

    Pool.prototype.put = function(obj) {
        if (!obj instanceof Object) {
            console.error(obj + " is not an object!");
            return;
        }
        this.objects[obj.id] = obj;
    };

    Pool.prototype.all = function() {
        return this.objects;
    };

    Pool.prototype.each = function(callback) {
        $.each(this.all(), callback);
    };

    return Pool;
});
