define(function(require) {
    "use strict";

    var $ = require("jquery"),
        Lane = require("lane"),
        Segment = require("geometry/segment");

    function Road(source, target) {
        this.id = window.__nextId++;
        this.source = source;
        this.target = target;
        this.lanes = [];
        this.lanesNumber = undefined;
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
        delete obj.lanesNumber;
        return obj;
    };

    Object.defineProperty(Road.prototype, "forwardLanes", {
        get: function() {
            return Math.floor((this.lanesNumber + 1) / 2);
        },
    });

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
            // throw Error("Incomplete road"); // TODO: don't create such roads
            return;
        }

        var i;
        this.sourceSideId = this.source.rect.getSectorId(this.target.rect.getCenter());
        this.sourceSide = this.source.rect.getSide(this.sourceSideId);
        this.targetSideId = this.target.rect.getSectorId(this.source.rect.getCenter());
        this.targetSide = this.target.rect.getSide(this.targetSideId);
        if (typeof this.lanesNumber === "undefined") {
            this.lanesNumber = Math.min(this.sourceSide.length, this.targetSide.length);
            this.lanesNumber = 2 * Math.floor(this.lanesNumber / 2);
        }
        var sourceSplits = this.sourceSide.split(this.lanesNumber, true),
            targetSplits = this.targetSide.split(this.lanesNumber);

        if (!this.lanes || this.lanes.length === 0) {
            this.lanes = [];

            for (i = 0; i < this.lanesNumber; i++) {
                if (i < this.forwardLanes) {
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
            if (i < this.forwardLanes) {
                this.lanes[i].sourceSegment = sourceSplits[i];
                this.lanes[i].targetSegment = targetSplits[i];
                if (i + 1 < this.forwardLanes) {
                    this.lanes[i].leftAdjacent = this.lanes[i + 1];
                }
                if (i > 0) {
                    this.lanes[i].rightAdjacent = this.lanes[i - 1];
                }
            } else {
                this.lanes[i].sourceSegment = targetSplits[i];
                this.lanes[i].targetSegment = sourceSplits[i];
                if (i > this.forwardLanes) {
                    this.lanes[i].leftAdjacent = this.lanes[i - 1];
                }
                if (i + 1 < this.lanesNumber) {
                    this.lanes[i].rightAdjacent = this.lanes[i + 1];
                }
            }
        }

        this.interlanes = [];
        for (i = 0; i < this.lanesNumber - 1; i++) {
            this.interlanes.push(new Segment(sourceSplits[i].source, targetSplits[i].target));
        }
    };

    return Road;
});
