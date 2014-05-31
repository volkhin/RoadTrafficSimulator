define(["jquery", "lane", "segment"], function($, Lane, Segment) {
    "use strict";

    function Road(source, target) {
        this.id = window.__nextId++;
        this._source = source;
        this._target = target;
        this.lanesNumber = 4; // FIXME: hack
        this.lanes = [];
        this.interlanes = [];
        this.update();
    }

    Road.copy = function(road) {
        if (typeof road._source === "number") {
            road._source = window.app.world.getIntersection(road._source);
        }
        if (typeof road._target === "number") {
            road._target = window.app.world.getIntersection(road._target);
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
            if (this.sourceSide && this.targetSide) {
                var a = this.sourceSide.source,
                    b = this.targetSide.target;
                return b.subtract(a).length;
            }
            return NaN;
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
        if (!this.source || !this.target) {
            // road is not ready to process - no source/junction intersections
            return;
        }

        var i;
        this.sourceSideId = this.source.rect.getSectorId(this.target.rect.getCenter());
        this.sourceSide = this.source.rect.getSide(this.sourceSideId);
        this.targetSideId = this.target.rect.getSectorId(this.source.rect.getCenter());
        this.targetSide = this.target.rect.getSide(this.targetSideId);
        var smallSide = Math.min(this.sourceSide.length, this.targetSide.length);
        // this.lanesNumber = smallSide /

        var sourceSplits = this.sourceSide.split(this.lanesNumber, true),
            targetSplits = this.targetSide.split(this.lanesNumber);

        if (!this.lanes || this.lanes.length === 0) {
            this.lanes = [];
            for (i = 0; i < this.lanesNumber; i++) {
                if (i < this.lanesNumber / 2) {
                    this.lanes.push(new Lane(
                        sourceSplits[i], targetSplits[i], this.source, this.target, this, true
                    ));
                } else {
                    this.lanes.push(new Lane(
                        targetSplits[i], sourceSplits[i], this.target, this.source, this, false
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
    };

    return Road;
});
