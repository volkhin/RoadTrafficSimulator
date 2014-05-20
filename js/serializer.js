define(function(require) {

    loader = {};
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
        function deepWalk(obj) {
            if (!(obj instanceof Object))
                return obj;
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = deepWalk(obj[key]);
                }
            }
            var constr = result.xxx_proto = obj.constructor.name;
            return result;
        }
        data = deepWalk(data);
        // localStorage.clear();
        localStorage[name] = JSON.stringify(data);
    }

    function load(name) {
        function deepWalk(obj) {
            if (!(obj instanceof Object))
                return obj;
            var result = {};
            for (var key in obj) {
                result[key] = deepWalk(obj[key]);
            }
            if ('xxx_proto' in result) {
                result.__proto__ = getLoader(result.xxx_proto);
                delete result.xxx_proto;
            }
            return result;
        }
        var data = localStorage[name];
        data = data && JSON.parse(data);
        // console.log(data);
        data = deepWalk(data);
        // console.log(data);
        return data;
    }

    return {
        save: save,
        load: load,
    };
});
