require.config({
    baseUrl: "js",
    paths: {
        "jquery": "../lib/jquery.min",
        "underscore": "../lib/underscore.min",
    },
});

require(["jquery", "app"], function($, App) {
    "use strict"; 

    $(document).ready(function () {
        window.app = new App();
        window.app.init();
    });
});
