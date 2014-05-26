define(["lane", "segment", "utils"], function(Lane, Segment, utils) {
    function Road(source, target) {
        this.id = window.__next_id++;
        this._source = source;
        this._target = target;
        this.lanesNumber = 2; // FIXME: hack
        this.lanes = [];
        this.interlanes = [];
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
        obj.interlanes = [];
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
        var i;
        if (this.source && this.target) {
            this.sourceSide = this.source.rect.getSector(this.target.rect.getCenter());
            this.targetSide = this.target.rect.getSector(this.source.rect.getCenter());

            var sourceSplits = this.sourceSide.split(this.lanesNumber, true),
                targetSplits = this.targetSide.split(this.lanesNumber);

            if (!this.lanes || this.lanes.length === 0) {
                this.lanes = [];
                for (i = 0; i < this.lanesNumber; i++) {
                    if (i < this.lanesNumber / 2) {
                        this.lanes.push(new Lane(
                            null, null, this.source, this.target, this
                        ));
                    } else {
                        this.lanes.push(new Lane(
                            null, null, this.target, this.source, this
                        ));
                    }
                }
            }
            for (i = 0; i < this.lanesNumber; i++) {
                if (i < this.lanesNumber / 2) {
                    this.lanes[i].sourceSegment = sourceSplits[i];
                    this.lanes[i].targetSegment = targetSplits[i];
                } else {
                    this.lanes[i].sourceSegment = targetSplits[i];
                    this.lanes[i].targetSegment = sourceSplits[i];
                }
            }

            this.interlanes = [];
            for (i = 0; i < this.lanesNumber - 1; i++) {
                this.interlanes.push(new Segment(sourceSplits[i].source, targetSplits[i].target));
            }
        }
    };

    return Road;
});
