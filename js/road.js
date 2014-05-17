define(["lane", "utils"], function(Lane, utils) {
    function Road(source, target) {
        this.id = window.__next_id++;
        this.source = source;
        this.target = target;
        this.update();
        this.lanesNumber = 3; // FIXME: hack
        this.lanes = [];
    }

    Road.prototype.getLength = function() {
        return utils.getDistance(this.getSource(), this.getTarget());
    };

    Road.prototype.setSource = function(source) {
        this.source = source;
    };

    Road.prototype.getSource = function() {
        return this.source;
    };

    Road.prototype.setTarget = function(target) {
        this.target = target;
    };

    Road.prototype.getTarget = function() {
        return this.target;
    };

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
