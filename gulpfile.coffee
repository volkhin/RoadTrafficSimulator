#TODO add liverload/brosersync

gulp = require 'gulp'
coffeelint = require 'gulp-coffeelint'
coffee = require 'gulp-coffee'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'
rename = require 'gulp-rename'
mocha = require 'gulp-mocha'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

gulp.task 'lint', ->
  gulp.src './coffee/**/*.coffee'
    .pipe coffeelint('coffeelint.json')
    .pipe coffeelint.reporter()

gulp.task 'js', ->
  gulp.src './coffee/**/*.coffee'
    .pipe coffee()
    .pipe gulp.dest './js/'

gulp.task 'build', ->
  browserify entries: ['./coffee/app.coffee'], extensions: ['.coffee', '.js']
    .transform 'coffeeify'
    .bundle()
    .pipe source 'main.js'
    .pipe gulp.dest './dist/'


gulp.task 'uglify', ['build'], ->
  gulp.src './dist/main.js'
    .pipe rename 'main.min.js'
    .pipe uglify()
    .pipe gulp.dest './dist/'


gulp.task 'test', ->
  testRunner = mocha
    ui: 'bdd'
    reporter: 'spec'
    compilers:
      coffee: 'coffee-script/register'
  gulp.src './coffee/spec/**/*.coffee', read: false
    .pipe testRunner

gulp.task 'default', ['lint', 'build', 'test', 'uglify']

gulp.task 'watch', ->
  gulp.watch './coffee/**/*.coffee', ['default']
