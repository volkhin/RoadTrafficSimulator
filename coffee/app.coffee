'use strict'

require './helpers.coffee'
$ = require 'jquery'
Visualizer = require './visualizer/visualizer.coffee'
DAT = require 'dat-gui'
World = require './model/world.coffee'
settings = require './settings.coffee'

$(document).ready ->
  window.world = new World
  world.load()
  window.visualizer = new Visualizer world
  visualizer.start()
  gui = new DAT.GUI
  gui.add world, 'save'
  gui.add world, 'load'
  gui.add world, 'clear'
  gui.add world, 'generateMap'
  gui.add(visualizer, 'running').listen()
  gui.add(visualizer, 'isDrawingIds').listen()
  gui.add(visualizer.zoomer, 'scale', 0.1, 2).listen()
  gui.add(visualizer, 'timeFactor', 0.1, 10).listen()
  gui.add(world, 'carsNumber').min(0).max(200).step(1).listen()
  gui.add(world, 'instantSpeed').step(0.00001).listen()
  gui.add(settings, 'lightsFlipInterval', 0, 10, 0.01).listen()
