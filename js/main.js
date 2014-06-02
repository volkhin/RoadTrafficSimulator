require.config({
    baseUrl: "js",
    paths: {
        "jquery": "../lib/jquery.min",
        "underscore": "../lib/underscore.min",
    },
});

require(function(require) {
    "use strict"; 

    var $ = require("jquery"),
        App = require("app");

    $(document).ready(function () {
        window.app = new App();
        window.app.init();
    });
});
