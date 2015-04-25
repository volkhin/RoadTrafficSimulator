'use strict'
#TODO add liverload/brosersync

gulp = require 'gulp'
gutil = require 'gulp-util'
coffeelint = require 'gulp-coffeelint'
coffee = require 'gulp-coffee'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'
mocha = require 'gulp-mocha'
plumber = require 'gulp-plumber'
notify = require 'gulp-notify'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

errorHandler = (e) ->
  gutil.log e
  @emit 'end'

gulp.task 'lint', ->
  gulp.src './coffee/**/*.coffee'
    .pipe coffeelint('coffeelint.json')
    .pipe coffeelint.reporter()

gulp.task 'js', ->
  gulp.src './coffee/**/*.coffee'
    .pipe coffee()
    .pipe gulp.dest './js/'

gulp.task 'build', ->
  notify('build started')
  b = browserify
    entries: ['./coffee/app.coffee']
    # transform: ['coffeeify']
    extensions: ['.coffee', '.js']
  b
    .transform 'coffeeify'
    .bundle()
    .on 'error', notify.onError 'build error'
    .on 'error', errorHandler
    .pipe source 'main.js'
    .pipe gulp.dest './dist/'

gulp.task 'uglify', ['build'], ->
  gulp.src './dist/main.js'
    .pipe rename 'main.min.js'
    .pipe uglify()
    .pipe gulp.dest './dist/'

gulp.task 'test', ->
  gulp.src './test/**/*-spec.coffee', read: false
    .pipe mocha
      ui: 'bdd'
      reporter: 'spec'
      compilers:
        coffee: 'coffee-script/register'
    .on 'error', notify.onError 'test error'
    .on 'error', errorHandler

gulp.task 'coverage', ->
  gulp.src './test/coverage-test.coffee', read: false
    .pipe mocha
      ui: 'bdd'
      reporter: 'html-cov'
      compilers:
        coffee: 'coffee-script/register'
    .on 'error', notify.onError 'test error'
    .on 'error', errorHandler

gulp.task 'default', ['build']
gulp.task 'full', ['lint', 'build', 'test', 'uglify']

gulp.task 'watch', ->
  gulp.watch './coffee/**/*.coffee', ['default']
