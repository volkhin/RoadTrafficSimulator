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
        var source = app.world.getJunction(this.source),
            target = app.world.getJunction(this.target);
        return utils.getDistance(source, target);
    };

    return Road;
});
