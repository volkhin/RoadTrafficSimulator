'use strict'

module.exports = (grunt) ->
  sources = ['Gruntfile.js', 'js/**/*.js', 'spec/**/*.js']
  require('load-grunt-tasks') grunt

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    coffeelint:
      app: 'coffee/**/*.coffee'
      options:
        configFile: 'coffeelint.json'
    browserify:
      dist:
        files:
          'dist/main.js': ['coffee/app.coffee']
        options:
          transform: ['coffeeify']
          bundleOptions:
            debug: false
    jasmine_node:
      all: ['coffee/spec']
      options:
        coffee: true
    uglify:
      'dist/main.min.js': ['dist/main.js']
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

  grunt.registerTask 'default', [
    'coffeelint',
    'browserify',
    'jasmine_node',
    'uglify'
  ]
