/* global module */
module.exports = function(grunt) {
  'use strict';

  var sources = ['Gruntfile.js', 'js/**/*.js', 'spec/**/*.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          baseUrl: 'js',
          mainConfigFile: 'js/main.js',
          name: 'main',
          out: 'dist/main.js',
          optimize: 'none',
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
        files: sources.concat(['coffee/**/*.coffee']),
        tasks: ['default'],
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
    },
    coffee: {
      compile: {
        expand: true,
        flatten: false,
        cwd: 'coffee',
        dest: 'js',
        src: ['**/*.coffee'],
        ext: '.js'
      }
    },
    coffeelint: {
      app: 'coffee/**/*.coffee'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-closure-linter');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-coffeelint');

  grunt.registerTask('default', ['coffeelint', 'coffee', 'jasmine']);
  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('closure', ['closureLint', 'closureFixStyle']);
};
