define(["lane", "utils"], function(Lane, utils) {
    function Road(source, target) {
        this.id = window.__next_id++;
        this._source = source;
        this._target = target;
        this.lanesNumber = 3; // FIXME: hack
        this.lanes = [];
        this.update();
    }

    Road.clone = function(road) {
        if (typeof road._source === "number") {
            road._source = app.world.getJunction(road._source);
        }
        if (typeof road._target === "number") {
            road._target = app.world.getJunction(road._target);
        }
        var result = Object.create(Road.prototype);
        return $.extend(result, road);
    };

    Road.prototype.toJSON = function() {
        var obj = $.extend({}, this);
        obj._source = obj._source.id;
        obj._target = obj._target.id;
        obj.lanes = []; // FIXME
        return obj;
    };

    Object.defineProperty(Road.prototype, "length", {
        get: function() {
            return utils.getDistance(this.source, this.target);
        },
    });

    Object.defineProperty(Road.prototype, "source", {
        get: function() {
            return this._source;
        },

        set: function(source) {
            this._source = source;
        },
    });

    Object.defineProperty(Road.prototype, "target", {
        get: function() {
            return this._target;
        },

        set: function(target) {
            this._target = target;
        },
    });

    Road.prototype.update = function() {
        if (this.source && this.target) {
            this.sourceSide = this.source.rect.getSector(this.target.rect.getCenter());
            this.targetSide = this.target.rect.getSector(this.source.rect.getCenter());

            var sourceSplits = this.sourceSide.split(this.lanesNumber),
                targetSplits = this.targetSide.split(this.lanesNumber, true);

            this.lanes = [];
            for (var i = 0; i < this.lanesNumber; i++) {
                this.lanes.push(new Lane(sourceSplits[i], targetSplits[i]));
            }
        }
    };

    return Road;
});
