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
            files: ["Gruntfile.js", "js/**/*.js", "spec/*.js"],
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
            requirejsTemplate: {
                src: "js/**/*.js",
                options: {
                    specs: "spec/*Spec.js",
                    helpers: "spec/*Helper.js",
                    template: require("grunt-template-jasmine-requirejs"),
                    templateOptions: {
                        requireConfigFile: "js/main.js",
                    },
                },
            },
        },
        watch: {
            scripts: {
                files: "js/**/*.js",
                tasks: ["jshint", "jasmine"],
                options: {
                    spawn: false,
                },
            },
        },
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["jshint", "jasmine"]);
    grunt.registerTask("test", ["jshint", "jasmine"]);
};
