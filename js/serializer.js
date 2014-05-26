define(function(require) {

    var loader = {};
    function getLoader(name) {
        if (typeof window[name] !== "undefined") {
            return window[name];
        }
        if (!(name in loader)) {
            try {
                loader[name] = require(name.toLowerCase());
            } catch (e) {
                console.error(e);
            }
        }
        return loader[name];
    }

    function save(name, data) {
        // FIXME: clean up original object
        /* function deepWalk(obj) {
            if (!(obj instanceof Object))
                return obj;
            // if (obj.hasOwnProperty("__xxx_id")) {
                // return {__xxx_ref: obj.__xxx_id};
            // }

            var result = {};
            // obj.__xxx_id = id++;
            // allObjects[obj.__xxx_id] = obj;
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = deepWalk(obj[key]);
                }
            }
            result.xxx_proto = obj.constructor.name;
            return result;
        } */

        // var allObjects = [], id = 0;
        // data = deepWalk(data);
        localStorage[name] = JSON.stringify(data);
    }

    function load(name) {
        /* function deepWalk(obj) {
            if (!(obj instanceof Object))
                return obj;
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = deepWalk(obj[key]);
                }
            }
            // if ('__xxx_id' in result) {
                // allObjects[result.__xxx_id] = result;
                // delete result.__xxx_id;
            // }
            if ('xxx_proto' in result) {
                result.__proto__ = getLoader(result.xxx_proto);
                delete result.xxx_proto;
            }
            return result;
        }

        function deepWalk2(obj) {
            if (!(obj instanceof Object))
                return obj;
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = deepWalk2(obj[key]);
                }
            }
            if ('__xxx_ref' in result) {
                return allObjects[result.__xxx_ref];
            }
            return result;
        } */

        // var allObjects = {};
        var data = localStorage[name];
        data = data && JSON.parse(data);
        // data = deepWalk(data);
        // data = deepWalk2(data);
        return data;
    }

    return {
        save: save,
        load: load,
    };
});
