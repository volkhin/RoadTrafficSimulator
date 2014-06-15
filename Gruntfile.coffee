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
          'dist/main.js': ['coffee/app.coffee']
        options:
          transform: ['coffeeify']
          bundleOptions:
            debug: false
    # jasmine:
      # coffeeTemplate:
        # src: 'js/**/*.js'
        # options:
          # specs: 'js/spec/*.js'
    jasmine_node:
      all: ['coffee/spec']
      options:
        coffee: true
        # forceExit: true

  grunt.registerTask 'default', ['coffeelint', 'jasmine_node', 'browserify']
