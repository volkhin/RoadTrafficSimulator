'use strict'

module.exports = (grunt) ->
  sources = ['Gruntfile.js', 'js/**/*.js', 'spec/**/*.js']
  require('load-grunt-tasks') grunt

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    jshint:
      files: sources
      options:
        jshintrc: true
    watch:
      scripts:
        files: ['coffee/**/*.coffee', 'Gruntfile.coffee']
        tasks: ['default']
        options:
          spawn: false
    coffee:
      compile:
        expand: true
        flatten: false
        cwd: 'coffee'
        dest: 'js'
        src: ['**/*.coffee']
        ext: '.js'
    coffeelint:
      app: 'coffee/**/*.coffee'
    browserify:
      dist:
        files:
          'dist/main.js': ['coffee/**/*.coffee']
        options:
          transform: ['coffeeify']
          bundleOptions:
            debug: false

  grunt.registerTask 'default', ['coffeelint', 'browserify']
