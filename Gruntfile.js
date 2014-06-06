/* global module */
module.exports = function(grunt) {
  'use strict';

  var sources = ['*.js', 'js/**/*.js', 'spec/**/*.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          baseUrl: './js',
          mainConfigFile: './js/main.js',
          name: 'main',
          out: './dist/app.js',
          optimize: 'none'
        }
      }
    },
    jshint: {
      files: sources,
      options: {
        jshintrc: true
      }
    },
    jasmine: {
      requirejsTemplate: {
        src: 'js/**/*.js',
        options: {
          specs: 'spec/*Spec.js',
          helpers: 'spec/*Helper.js',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: 'js/main.js'
          }
        }
      }
    },
    watch: {
      scripts: {
        files: sources,
        tasks: ['jshint', 'jasmine'],
        options: {
          spawn: false
        }
      }
    },
    closureLint: {
      options: {
        strict: true
      },
      app: {
        src: sources,
        command: 'gjslint'
      }
    },
    closureFixStyle: {
      options: {
        strict: true
      },
      app: {
        src: sources,
        command: 'fixjsstyle'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-closure-linter');

  grunt.registerTask('default', ['jshint', 'jasmine']);
  grunt.registerTask('test', ['jshint', 'jasmine']);
};
