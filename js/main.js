require.config({
    baseUrl: "js",
    paths: {
        "jquery": "../lib/jquery.min",
        "jquery-mousewheel": "../lib/jquery.mousewheel.min",
        "underscore": "../lib/underscore.min",
    },
    shim: {
        "jquery-mousewheel": ["jquery"],
    },
});

define(function(require) {
    "use strict"; 

    var $ = require("jquery"),
        App = require("app");

    $(document).ready(function () {
        window.app = new App();
        window.app.init();
    });
});
