define(["utils"], function(utils) {
    function Road(source, target) {
        this.id = window.__next_id++;
        if (source instanceof Object) {
            this.source = source.id;
        } else {
            this.source = source;
        }
        if (target instanceof Object) {
            this.target = target.id;
        } else {
            this.target = target;
        }
    };

    Road.prototype.getLength = function() {
        return utils.getDistance(this.getSource(), this.getTarget());
    };

    Road.prototype.getSource = function() {
        return app.world.getJunction(this.source);
    };

    Road.prototype.getTarget = function() {
        return app.world.getJunction(this.target);
    };

    return Road;
});
