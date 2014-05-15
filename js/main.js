require.config({
    paths: {
        "jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
        "underscore": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min",
    },
});

require(["app"]);

require(["jquery", "app"], function($, App) {
    $(document).ready(function () {
        window.app = new App();
        app.init();
    });
});
