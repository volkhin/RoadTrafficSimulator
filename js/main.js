require.config({
    baseUrl: "js",
    paths: {
        "jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
        "underscore": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min",
    },
});

require(["jquery", "app"], function($, App) {
    "use strict"; 

    $(document).ready(function () {
        window.app = new App();
        window.app.init();
    });
});
