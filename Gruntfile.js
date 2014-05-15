module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        requirejs: {
            compile: {
                options: {
                    baseUrl: './js',
                    mainConfigFile: './js/main.js',
                    name: 'main',
                    out: './dist/app.js',
                    optimize: "none",
                },
            },
        },
        jshint: {
            files: ["Gruntfile.js", "js/**/*.js"],
            options: {
                maxerr: 30,
                // undef: true,
                // unused: true,
                globals: {
                    jQuery: true,
                    console: true,
                    module: false,
                    alert: true,
                },
            },
        },
        jasmine: {
            src: "js/**/*.js",
        },
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-jasmine");

    grunt.registerTask("default", ["jshint", "jasmine", "requirejs"]);
};
