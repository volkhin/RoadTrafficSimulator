define([], function() {
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

    return Road;
});
